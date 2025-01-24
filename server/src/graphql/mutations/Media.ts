import { GraphQLError } from 'graphql';
import { ApolloContext } from '../context';
import { MutationResolvers } from '../generated/graphql';
import { deleteFile } from '../s3';
import { type Media as MediaType } from '../generated/graphql';

export const createMedia: MutationResolvers<ApolloContext>['createMedia'] =
  async (_parent, args, { db }) => {
    try {
      console.log('GRAPHQL: a media item is about to be created...');
      const result = await db.media.createMedia(args);
      console.log('GRAPHQL: a media item was created:', result, args);
      return result;
    } catch (error) {
      console.log(
        'GRAPHQL: an error occured while trying to create media. Attempting to delete.',
      );
      deleteFile(args.key)
        .then((d) => console.log('successfully deleted media', d))
        .catch((err) => console.log('could not delete media', err));
      throw new GraphQLError(error);
    }
  };

export const deleteManyMedia: MutationResolvers<ApolloContext>['deleteManyMedia'] =
  async (_parent, { mediaIds }, { db, user }) => {
    if (!user?.id) {
      throw new GraphQLError('You must be logged in to delete media.');
    }
    try {
      const deleteRequesterId = user?.id;

      const mediaToDelete = (await db.media.findMany({
        where: { id: { in: mediaIds } },
      })) as MediaType[];

      // Reject whole batch if it includes an unauthorized resource
      const FORBIDDEN = mediaToDelete.includes(
        (item) => item.userId !== deleteRequesterId,
      );

      if (FORBIDDEN) {
        throw new GraphQLError(
          'You are not authorized to perform this action.',
          {
            extensions: {
              code: 'FORBIDDEN',
            },
          },
        );
      }

      // If authorized, delete media w/ single or batch methods
      let deletedMedia: MediaType[];
      if (mediaIds.length === 1) {
        const deleted = (await db.media.deleteMedia({
          id: mediaIds[0],
          deleteRequesterId,
        })) as MediaType;
        deletedMedia = [deleted];
      } else {
        deletedMedia = (await db.media.deleteManyMedia({
          deleteRequesterId,
          mediaIds,
        })) as MediaType[];
      }

      // Delete from s3 when done
      const deleteFilePromises = deletedMedia.map((media) => {
        const { key } = media;
        return deleteFile(key);
      });

      await Promise.all(deleteFilePromises);

      // Return deleted
      return mediaToDelete;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

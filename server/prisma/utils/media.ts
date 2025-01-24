import { Prisma, Media } from '@prisma/client';
import {
  MutationCreateMediaArgs,
} from '../../src/graphql/generated/graphql';

export const MediaExtension = Prisma.defineExtension({
  name: 'Media',
  model: {
    media: {
      async createMedia<T>(
        this: T,
        {
          key,
          extension,
          filename,
          mimetype,
          size,
          tweetId,
          uploaderId,
          asAvatar = false,
        }: MutationCreateMediaArgs,
      ) {
        const context = Prisma.getExtensionContext(this);

        const q: Prisma.MediaCreateArgs = {
          data: {
            key,
            extension,
            size,
            filename,
            mimetype,
            uploader: uploaderId ? { connect: { id: uploaderId } } : undefined,
            avatarUser: (uploaderId && asAvatar) ? { connect: { id: uploaderId } } : undefined,
            tweet: tweetId ? { connect: { id: tweetId } } : undefined
          },
        };

        const result: Media = await (context as any).create(q);
        return result;
      },
      async deleteMedia<T>(
        this: T,
        { id, deleteRequesterId }: { id: string; deleteRequesterId: string },
      ) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.MediaDeleteArgs = { where: { id, uploaderId: deleteRequesterId } };

        const result: Media = await (context as any).delete(q);
        return result;
      },
      async deleteManyMedia<T>(
        this: T,
        {
          mediaIds,
          deleteRequesterId,
        }: { mediaIds: string[]; deleteRequesterId: string },
      ) {
        const context = Prisma.getExtensionContext(this);

        const where = { id: { in: mediaIds }, userId: deleteRequesterId };
        const deleteQ: Prisma.MediaDeleteManyArgs = { where };

        const result = await (context as any).deleteMany(deleteQ);
        return result;
      },
    },
  },
});

export default MediaExtension;

import { GraphQLError } from 'graphql';
import { ApolloContext } from '../context';
import { MutationResolvers, PostType, type Post as PostEntityType } from '../generated/graphql';
import { deleteFile } from '../s3';

export const markPostsAsSeen: MutationResolvers<ApolloContext>['markPostsAsSeen'] =
  async (_parent, { postIds }, { db, seenPostsCache }) => {
    if (!seenPostsCache) {
      throw new Error('Seen tweets cache not initialized');
    }

    postIds.forEach((post) => {
      if (!seenPostsCache.includes(post)) {
        seenPostsCache.push(post);
        console.log(`Added post ${post} to seen tweets cache`);
      }
    });

    return true;
  };

export const deletePost: MutationResolvers<ApolloContext>['deletePost'] =
  async (_parent, { authorId, postId }, { db, user }) => {
    try {
      if (!user?.id || (user?.id !== authorId)) {
        throw new GraphQLError(
          'You are not authorized to perform this action.',
          {
            extensions: {
              code: 'FORBIDDEN',
            },
          },
        );
      }

      const deletedPost = await db.post.deletePost({ postId, authorId }) as PostEntityType;

      // Delete media associated with post/tweet from s3
      if (deletedPost.type === PostType.Tweet) {
        const mediaToDelete = deletedPost.tweet?.media;
        
        const deleteFilePromises = mediaToDelete.map((item) => {
          const { key } = item;
          return deleteFile(key);
        });

        await Promise.all(deleteFilePromises);
      }

      return deletedPost;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

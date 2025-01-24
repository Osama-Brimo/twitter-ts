import { Like, Post, Prisma } from '@prisma/client';
import { Order } from '../types';

export const LikeExtension = Prisma.defineExtension({
  name: 'Like',
  model: {
    like: {
      // Read
      async getLikeByTweetAndUser<T>(this: T, { userId, tweetId }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.LikeFindFirstArgs = { where: { userId, tweetId } };
        const results: Like = await (context as any).findFirst(q);
        return results;
      },
      async getAllUserLikesSortedByDate<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
        handle: string,
      ): Promise<[Like]> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.LikeFindManyArgs = {
          where: { user: { handle } },
          orderBy: { createdAt: order },
          include: {
            user: {
              include: {
                followers: true,
                following: true,
              },
            },
            tweet: {
              include: {
                author: true,
                likes: true,
                retweets: true,
                quoting: true,
                quotedBy: true,
              },
            },
          },
        };

        limit && (q.take = limit);
        offset && (q.skip = offset);

        const result: [Like] = await (context as any).findMany(q);
        return result;
      },
      // Create
      async createLike<T>(this: T, { userId, tweetId }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.LikeCreateArgs = {
          data: {
            tweet: { connect: { id: tweetId } },
            user: { connect: { id: userId } },
          },
        };
        const results: Like = await (context as any).create(q);
        return results;
      },
    },
  },
});

export default LikeExtension;

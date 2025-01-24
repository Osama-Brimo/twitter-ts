import { Retweet, Prisma } from '@prisma/client';
import { MutationRetweetTweetArgs } from '../../src/graphql/generated/graphql';

export const RetweetExtension = Prisma.defineExtension({
  name: 'Retweet',
  model: {
    retweet: {
      // Read
      async getRetweetByTweetAndUser<T>(this: T, { userId, tweetId }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.RetweetFindFirstArgs = { where: { userId, tweetId } };
        const results: Retweet = await (context as any).findFirst(q);
        return results;
      },
      // Create
      async createRetweet<T>(this: T, { userId, tweetId }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.RetweetCreateArgs = {
          data: {
            tweet: { connect: { id: tweetId } },
            user: { connect: { id: userId } },
          },
        };
        const results: Retweet = await (context as any).create(q);
        return results;
      },
    },
  },
});

export default RetweetExtension;

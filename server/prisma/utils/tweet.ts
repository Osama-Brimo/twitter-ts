import { Order } from '../types';
import { GalleryType, Prisma, Tweet } from '@prisma/client';
import {
  MutationCreateTweetArgs,
  MutationDeleteTweetArgs,
} from '../../src/graphql/generated/graphql';

export const TweetExtension = Prisma.defineExtension({
  name: 'Tweet',
  model: {
    tweet: {
      // Read
      async getAllSortedByDate<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
      ): Promise<[Tweet]> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.TweetFindManyArgs = {
          orderBy: { createdAt: order },
          include: {
            author: {
              include: {
                followers: true,
                following: true,
              },
            },
            likes: true,
            retweets: true,
            quoting: true,
          },
          where: {
            parentId: null,
          },
        };

        limit && (q.take = limit);
        offset && (q.skip = offset);

        const result: [Tweet] = await (context as any).findMany(q);
        return result;
      },
      // Create
      async createTweet<T>(
        this: T,
        { authorId, content, media, replyOf, quoteOf }: MutationCreateTweetArgs,
      ): Promise<Tweet> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.TweetCreateArgs = {
          data: {
            content,
            author: { connect: { id: authorId } },
            meta: { create: { galleryType: GalleryType.QUILT } }, // Default meta value
          },
        };

        if(media?.length) {
          const galleryType = media.length > 4 ? GalleryType.CAROUSEL : GalleryType.QUILT;
          const meta = { create: { galleryType } };

          q.data.meta = meta;
          q.data.media = {
            connect: media.map((id) => {
              return { id };
            }),
          }
        }

        quoteOf && (q.data.quoting = { connect: { id: quoteOf } });
        replyOf && (q.data.parent = { connect: { id: replyOf } });
        const result: Tweet = await (context as any).create(q);
        return result;
      },
      // Delete
      async deleteTweet<T>(
        this: T,
        { tweetId, authorId }: MutationDeleteTweetArgs,
      ): Promise<Tweet> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.TweetDeleteArgs = {
          where: { id: tweetId, authorId: authorId },
        };
        const result: Tweet = await (context as any).delete(q);
        return result;
      },
    },
  },
});

export default TweetExtension;

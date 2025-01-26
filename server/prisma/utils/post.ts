import { Order } from '../types';
import db from '../../src/graphql/context';
import { Prisma, Post } from '@prisma/client';
import {
  MutationCreatePostArgs,
  MutationDeletePostArgs,
  PostType,
} from '../../src/graphql/generated/graphql';

type SearchResult = {
  count: number;
  result: Post[];
};

export const PostExtension = Prisma.defineExtension({
  name: 'Post',
  model: {
    post: {
      // Read
      async getPost<T>(this: T, { id }): Promise<Post> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.PostFindUniqueArgs = {
          where: { id },
          include: {
            author: {
              include: {
                followers: true,
                following: true,
                avatar: true,
              },
            },
            tweet: {
              include: {
                author: {
                  include: {
                    followers: true,
                    following: true,
                    avatar: true,
                  },
                },
                children: {
                  include: {
                    author: {
                      include: { avatar: true },
                    },
                    media: true,
                    children: true,
                    post: true,
                    meta: true,
                  },
                },
                parent: {
                  include: {
                    meta: true,
                    children: true,
                    author: { include: { avatar: true } },
                  },
                },
                retweets: true,
                likes: true,
                media: true,
                meta: true,
              },
            },
            retweet: {
              include: {
                tweet: {
                  include: {
                    author: true,
                    retweets: true,
                    likes: true,
                    media: true,
                    meta: true,
                  },
                },
                user: true,
              },
            },
          },
        };

        const result: Post = await (context as any).findUnique(q);
        return result;
      },
      async getAllPostsSortedByDate<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
        handle: string,
      ): Promise<[Post]> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.PostFindManyArgs = {
          where: { tweet: { parentId: null } },
          orderBy: { createdAt: order },
          include: {
            author: {
              include: {
                followers: true,
                following: true,
                avatar: true,
              },
            },
            tweet: {
              include: {
                author: {
                  include: {
                    followers: true,
                    following: true,
                    avatar: true,
                  },
                },
                children: {
                  include: {
                    author: {
                      include: { avatar: true },
                    },
                    media: true,
                    children: true,
                    post: true,
                    meta: true,
                  },
                },
                parent: {
                  include: {
                    meta: true,
                  },
                },
                retweets: true,
                likes: true,
                media: true,
                meta: true,
              },
            },
            retweet: {
              include: {
                tweet: {
                  include: {
                    author: true,
                    retweets: true,
                    likes: true,
                    media: true,
                    meta: true,
                  },
                },
                user: true,
              },
            },
          },
        };

        limit && (q.take = limit);
        offset && (q.skip = offset);
        handle && (q.where = { author: { handle } });

        const result: [Post] = await (context as any).findMany(q);
        return result;
      },
      async searchPostsAndCount<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
        q: string,
        hashtag: string,
        includeRetweets: boolean,
      ): Promise<SearchResult> {
        const context = Prisma.getExtensionContext(this);
        const query: Prisma.PostFindManyArgs = {
          orderBy: { createdAt: order },
          where: { type: PostType.Tweet },
          include: {
            author: {
              include: {
                followers: true,
                following: true,
              },
            },
            tweet: {
              include: {
                author: true,
                retweets: true,
                likes: true,
                meta: true,
              },
            },
          },
        };

        const where: Prisma.PostFindManyArgs['where'] = {
          type: { equals: PostType.Tweet },
          tweet: { content: { contains: q } },
        };

        // Unset where type must be tweet if retweets are included
        includeRetweets && delete query.where;
        // Add hashtag if present
        hashtag && (where.tweet.hashtags = { some: { hashtag } });
        query.where = where;

        limit && (query.take = limit);
        offset && (query.skip = offset);

        const [result, count] = await db.$transaction([
          (context as any).findMany(query),
          (context as any).count({ where }),
        ]);

        console.log('found this...', { result, count });

        return { result, count };
      },
      // Create
      /**
       * Creates a `Post` which represents any possible feed item creatable by a `User`.
       *
       * For example, a `Tweet` and a `Retweet` of the same tweet, can be shown in one feed as two distinct posts. This allows us to fetch various types of feed items in one db call, and record interactions across types, etc.
       *
       * @param authorId - Author of the `Post`.
       * @param type - What the `Post` represents.
       * @param postRetweetUserId - The id of the retweeter if the post represents a retweet, if any.
       * @param postRetweetTweetId - The id of the `Tweet` which the `Retweet` is retweeting, if any.
       * @param postTweetId - The id of the `Tweet` the `Post` should represent, if it represents a `Tweet` directly.
       * @returns Post
       */
      async createPost<T>(
        this: T,
        {
          authorId,
          type,
          postRetweetUserId,
          postRetweetTweetId,
          postTweetId,
        }: MutationCreatePostArgs,
      ): Promise<Post> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.PostCreateArgs = {
          data: {
            type,
            author: { connect: { id: authorId } },
          },
          include: {
            author: {
              include: {
                followers: true,
                following: true,
                avatar: true,
              },
            },
            tweet: {
              include: {
                author: {
                  include: {
                    followers: true,
                    following: true,
                    avatar: true,
                  },
                },
                children: {
                  include: {
                    author: {
                      include: { avatar: true },
                    },
                    media: true,
                    children: true,
                    post: true,
                    meta: true,
                  },
                },
                parent: {
                  include: {
                    meta: true,
                  },
                },
                retweets: true,
                likes: true,
                media: true,
                meta: true,
              },
            },
            retweet: {
              include: {
                tweet: {
                  include: {
                    author: true,
                    retweets: true,
                    likes: true,
                    media: true,
                    meta: true,
                  },
                },
                user: true,
              },
            },
          },
        };

        // connect provided record based on post type, leave rest null
        switch (type) {
          case PostType.Tweet:
            q.data.tweet = { connect: { id: postTweetId } };
            break;
          case PostType.Retweet:
            q.data.retweet = {
              connect: {
                tweetId_userId: {
                  tweetId: postRetweetTweetId,
                  userId: postRetweetUserId,
                },
              },
            };
            break;
          default:
            // TODO: throw error properly here
            throw new Error(`Invalid Post type: ${type}`);
        }

        const result: Post = await (context as any).create(q);
        return result;
      },
      // Delete
      async deletePost<T>(
        this: T,
        { postId }: MutationDeletePostArgs,
      ): Promise<Post> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.PostDeleteArgs = {
          where: { id: postId },
          include: {
            tweet: { include: { media: true } },
          },
        };
        const result: Post = await (context as any).delete(q);
        return result;
      },
    },
  },
});

export default PostExtension;

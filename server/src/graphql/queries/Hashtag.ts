import { Prisma } from '@prisma/client';
import { ApolloContext } from '../context';
import { QueryResolvers } from '../generated/graphql';
import { GraphQLError } from 'graphql';

export const searchHashtagsAndCount: QueryResolvers<ApolloContext>['searchHashtagsAndCount'] =
  async (_parent, { q, limit, offset }, { db }) => {
    try {
      const searchResult = await db.hashtag.searchHashtagsAndCount(
        'desc',
        limit,
        offset,
        q,
      );
      return searchResult;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

export const getHashtag: QueryResolvers<ApolloContext>['getHashtag'] = async (
  _parent,
  { hashtag },
  { db },
) => {
  try {
    const result = await db.hashtag.findUnique({
      where: { hashtag },
      include: { tweets: true },
    });

    if(!result?.id) {
      throw new GraphQLError(`Could not find hashtag ${hashtag}`);
    }

    return result;
  } catch (error) {
    throw new GraphQLError(error);
  }
};

export const getTrendingHashtags: QueryResolvers<ApolloContext>['getTrendingHashtags'] =
  async (_parent, _args, { db }) => {
    try {
      // Get 3 most popular hashtags by tweet count
      const result = await db.hashtag.findMany({
        take: 4,
        orderBy: {
          tweets: {
            _count: 'desc',
          },
        },
        include: {
          tweets: true,
        }
      });

      console.log(`[getTrendingHashtags]`, result);

      return result;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

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
      throw new GraphQLError(error.message);
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
    return result;
  } catch (error) {
    throw new GraphQLError(error.message);
  }
};

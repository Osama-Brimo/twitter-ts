import { Prisma } from '@prisma/client';
import { ApolloContext } from '../context';
import { QueryResolvers } from '../generated/graphql';

export const allTweets: QueryResolvers<ApolloContext>['allPosts'] = async (
  _parent,
  { offset, limit },
  { db },
) => {
  const result = await db.tweet.getAllSortedByDate('desc', limit, offset);
  return result;
};
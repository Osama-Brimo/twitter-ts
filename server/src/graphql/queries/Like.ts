import { ApolloContext } from '../context';
import { QueryResolvers } from '../generated/graphql';
import { GraphQLError } from 'graphql';

export const allUserLikes: QueryResolvers<ApolloContext>['allUserLikes'] = async (
  _parent,
  { handle, offset, limit },
  { db },
) => {
  try {
    const result = await db.like.getAllUserLikesSortedByDate('desc', limit, offset, handle);
    
    return result;
  } catch (error) {
    throw new GraphQLError(error);
  }
};
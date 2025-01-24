import { Prisma } from '@prisma/client';
import { ApolloContext } from '../context';
import { QueryResolvers } from '../generated/graphql';
import { GraphQLError } from 'graphql';

export const allPosts: QueryResolvers<ApolloContext>['allPosts'] = async (
  _parent,
  { offset, limit },
  { db },
) => {
  try {
    const result = await db.post.getAllPostsSortedByDate('desc', limit, offset);

    console.log(`[allPost]: GraphQL reoslver's result after awaiting:` ,result);

    return result;
  } catch (error) {
    throw new GraphQLError(error);
  }

};

export const getPostWithReplies: QueryResolvers<ApolloContext>['getPostWithReplies'] = async (
  _parent,
  { id },
  { db },
) => {
  try {
    if(!id) throw new GraphQLError('No id provided for post.');

    const result = await db.post.getPost({ id });

    console.log('[getPostWithReplies]: Found post:', id, result);

    if (result?.id) return result;
  } catch (error) {
    throw new GraphQLError(error);
  }
};

export const allUserPosts: QueryResolvers<ApolloContext>['allUserPosts'] = async (
  _parent,
  { handle, offset, limit },
  { db },
) => {
  try {
    const result = await db.post.getAllPostsSortedByDate('desc', limit, offset, handle);
    console.log('prisma result from Post.ts resolver...', result);
    return result;
  } catch (error) {
    throw new GraphQLError(error);
  }
};

export const searchPostsAndCount: QueryResolvers<ApolloContext>['searchPostsAndCount'] = async (
  _parent,
  { q, limit, offset, includeRetweets },
  { db },
) => {
  try {
    const searchResult = await db.post.searchPostsAndCount('desc', limit, offset, q, null, includeRetweets);
    return searchResult;
  } catch (error) {
    throw new GraphQLError(error);
  }
};

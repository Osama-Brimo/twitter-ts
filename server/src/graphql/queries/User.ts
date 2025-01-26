import { GraphQLError } from 'graphql';
import { ApolloContext } from '../context';
import { IntersectionUserTypes, QueryResolvers } from '../generated/graphql';
import {
  findModelIntersection,
  getPotentialMutuals,
  getRecentlyInteracted,
  getWhoMutualsFollow,
} from './helpers/helpers';

export const currentUser: QueryResolvers<ApolloContext>['currentUser'] = (
  _parent,
  _args,
  { user },
) => {
  return user;
};

export const userByHandle: QueryResolvers<ApolloContext>['userByHandle'] =
  async (_parent, { handle }, { db }) => {
    try {
      const result = await db.user.findFirst({
        where: { handle: { equals: handle, mode: 'insensitive' } },
        include: { followers: true, following: true },
      });

      if (!result?.id) {
        return null;
      }

      return result;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

export const allUserFollowing: QueryResolvers<ApolloContext>['allUserFollowing'] =
  async (_parent, { handle, offset, limit }, { db }) => {
    try {
      const result = await db.user.getAllUserFollowingSortedByDate(
        'desc',
        limit,
        offset,
        handle,
      );

      return result;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

export const allUserFollowers: QueryResolvers<ApolloContext>['allUserFollowers'] =
  async (_parent, { handle, offset, limit }, { db }) => {
    try {
      const result = await db.user.getAllUserFollowersSortedByDate(
        'desc',
        limit,
        offset,
        handle,
      );
      return result;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

export const searchUsersAndCount: QueryResolvers<ApolloContext>['searchUsersAndCount'] =
  async (_parent, { q, limit, offset }, { db }) => {
    try {
      const searchResult = await db.user.searchUsersAndCount(
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

export const findCommonBetweenUsers: QueryResolvers<ApolloContext>['findCommonBetweenUsers'] =
  async (_parent, { handleA, handleB, intersectionUserType }, { db }) => {
    try {
      const {
        id: idA,
        following: followingA,
        followers: followersA,
      } = (await db.user.getByHandle(handleA)) ?? {};
      const {
        id: idB,
        following: followingB,
        followers: followersB,
      } = (await db.user.getByHandle(handleB)) ?? {};

      if (idA && idB) {
        switch (intersectionUserType) {
          case IntersectionUserTypes.Followers:
            return findModelIntersection(followersA, followersB);
          case IntersectionUserTypes.Following:
            return findModelIntersection(followingA, followingB);
          case IntersectionUserTypes.FollowingFollowers:
            return findModelIntersection(
              [...followingA, ...followersA],
              [...followingB, ...followersB],
            );
          default:
            break;
        }
      }
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

/**
 * Gets user suggestions for currently logged in user.
 *
 * This implements a simple suggestion algorithm, without vip-based ranking:
 *
 * 1. Get recently interacted with users
 * 2. Get users who the target user's mutuals follow
 * 3. Get users who follow the target user but aren't followed back
 * 4. Count frequency of each handle
 * 5. Sort by frequency and take top 4
 *
 * @returns Array of user suggestions, or empty array if no suggestions found.
 */
export const getUserSuggestions: QueryResolvers<ApolloContext>['getUserSuggestions'] =
  async (_parent, _args, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('Must be logged in to get suggestions');
      }

      console.log(
        '[getUserSuggestions] Getting suggestions for user:',
        user.handle,
      );

      const handles: string[] = [];

      // Get suggestions from each source
      handles.push(...(await getRecentlyInteracted(user, db)));
      handles.push(...(await getWhoMutualsFollow(user, db)));
      handles.push(...(await getPotentialMutuals(user, db, 2)));

      // No potential suggestions found, return empty array
      if (!handles.length) {
        console.log(
          `[getUserSuggestions]: No suggestions found for ${user.handle}.`,
        );
        return [];
      }

      // Count frequency and sort
      const handleCounts = handles.reduce(
        (acc, handle) => {
          acc[handle] = (acc[handle] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Sort by frequency and take top 4
      const uniqueHandles = [...new Set(handles)]
        .sort((a, b) => handleCounts[b] - handleCounts[a])
        .slice(0, 4);

      console.log(
        '[getUserSuggestions] Final suggested handles:',
        uniqueHandles,
      );

      // Fetch full user objects
      const suggestedUsers = await db.user.findMany({
        where: { handle: { in: uniqueHandles } },
        include: {
          followers: true,
          following: true,
          avatar: true,
        },
      });

      if (!suggestedUsers?.length) {
        throw new GraphQLError(
          '[getUserSuggestions]: Handles returned, but there was a problem fetching users.',
        );
      }

      return suggestedUsers;
    } catch (error) {
      console.error('[getUserSuggestions] Error:', error);
      throw new GraphQLError(error.message);
    }
  };

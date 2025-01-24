import { GraphQLError } from 'graphql';
import { ApolloContext } from '../context';
import {
  IntersectionTypes,
  IntersectionUserTypes,
  QueryResolvers,
} from '../generated/graphql';

function findModelIntersection(arrA: any[], arrB: any[]) {
  return arrA.filter((a) => arrB.find((b) => a.id === b.id));
}

export const currentUser: QueryResolvers<ApolloContext>['currentUser'] = (
  _parent,
  _args,
  { user },
) => {
  // console.log(user, 'user from currentuser...');
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

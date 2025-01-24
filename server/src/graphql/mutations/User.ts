// import { AuthenticationError, UserInputError } from '@apollo/server';
import { GraphQLError } from 'graphql';
import { checkPassword, createToken } from '../../utils/auth';
import { ApolloContext } from '../context';
import {
  MutationResolvers,
  UserPayload as GraphQLUserPayload,
} from '../generated/graphql';
import { User as PrismaUserType } from '@prisma/client';

type JWT = GraphQLUserPayload['token'];
// TODO: this typing is not great, but it's fine for now. Payload wants a prisma (not GQL) User.

interface UserPayload {
  token: JWT;
  user: PrismaUserType;
}

export const createUser: MutationResolvers<ApolloContext>['createUser'] =
  async (_parent, args, { db }) => {
    try {
      let errJson: string;
      const { handle, email } = args;

      const existingEmail = await db.user.findUnique({ where: { email } });

      if (existingEmail?.id) {
        errJson = JSON.stringify({
          message: 'A user with this Email already exists.',
          field: 'email',
          code: 'VALIDATION',
        });
        throw new GraphQLError(errJson, {
          extensions: {
            field: 'email',
            code: 'VALIDATION',
          },
        });
      }

      const existingHandle = await db.user.findUnique({ where: { handle } });

      if (existingHandle?.id) {
        errJson = JSON.stringify({
          message: 'A user with this handle already exists.',
          field: 'handle',
          code: 'VALIDATION',
        });
        throw new GraphQLError(errJson, {
          extensions: {
            field: 'handle',
            code: 'VALIDATION',
          },
        });
      }

      const newUser = await db.user.createUser(args);

      if (newUser?.id) {
        const token: JWT = createToken({ sub: newUser.id });
        const userPayload: UserPayload = { token, user: newUser };
        return userPayload;
      }
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

export const loginUser: MutationResolvers<ApolloContext>['loginUser'] = async (
  _parent,
  { email, password },
  { db, user },
) => {
  try {
    let errJson: string;
    // check if logged in already
    if (user?.id) throw new GraphQLError('User already logged in!');

    // check if user exists
    const foundUser = await db.user.findFirst({ where: { email } });

    if (!foundUser?.id) {
      errJson = JSON.stringify({
        message: 'No account with this email exists.',
        field: 'email',
        code: 'VALIDATION',
      });
      throw new GraphQLError(errJson, {
        extensions: {
          field: 'email',
          code: 'VALIDATION',
        },
      });
    }

    // check if passwords match
    const passwordsMatch = await checkPassword(password, foundUser.password);
    if (!passwordsMatch) {
      // Due to some weird issue, and despite doc specs, gql will ignores extensions field. Temporary workaround for now.
      errJson = JSON.stringify({
        message: 'Incorrect Email or Password.',
        field: 'password',
        code: 'VALIDATION',
      });
      throw new GraphQLError(errJson, {
        extensions: {
          field: 'password',
          code: 'VALIDATION',
        },
      });
    }

    // Return user payload
    const token: JWT = createToken({ sub: foundUser.id });
    const userPayload: UserPayload = { token, user: foundUser };

    return userPayload;
  } catch (error) {
    throw new GraphQLError(error);
  }
};

export const logoutUser: MutationResolvers<ApolloContext>['logoutUser'] = (
  _parent,
  _args,
  { user, res },
) => {
  try {
    if (!user?.id) {
      throw new GraphQLError('No user is currently logged in.', {
        extensions: {
          // TODO: !errors
          code: '',
        },
      });
    }

    // Clear the JWT cookie
    res.clearCookie('jwt_authorization', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return true;
  } catch (error) {
    throw new GraphQLError(error);
  }
};

export const followUser: MutationResolvers<ApolloContext>['followUser'] =
  async (_parent, { userId }, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('You must be logged in to follow users.', {
          extensions: {
            // TODO: !errors
            code: 'FORBIDDEN',
          },
        });
      }

      const userToFollow = await db.user.findUnique({
        where: { id: userId },
        include: { blockList: true, blockerList: true, },
      });

      if (!userToFollow?.id || !userId)
        throw new GraphQLError(`Couldn't follow user (user not found).`);

      // Check if follow requester is blocked
      if (userToFollow.blockList.some((u) => user.id === u.id)) {
        throw new GraphQLError('You are blocked by this user.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      // Check if follow requester is blocking user (should not be able to follow and be blocking)
      if (userToFollow.blockerList.some((u) => user.id === u.id)) {
        throw new GraphQLError('You are blocking this user. You cannot follow a user while blocking them.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      // User is private. The follow will become a request instead, and the user will be notified.
      if (userToFollow.isPrivate) {
        await db.notification.createNotification({
          userId: user.id,
          link: `/user/${userToFollow.handle}`,
          type: 'followRequest',
        });

        return userToFollow;
      }

      const followedUser = await db.user.followUser({
        userId: user?.id,
        targetId: userId,
      });

      if (followedUser?.id) {
        return followedUser;
      } else {
        throw new GraphQLError(
          'A problem occured while trying to follow user.',
        );
      }
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

export const unfollowUser: MutationResolvers<ApolloContext>['unfollowUser'] =
  async (_parent, { userId }, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('User not logged in');
      }

      const unfollowedUser = await db.user.unfollowUser({
        userId: user?.id,
        targetId: userId,
      });

      if (unfollowedUser?.id) {
        return unfollowedUser;
      } else {
        throw new GraphQLError(
          'A problem occured while trying to unfollow user.',
        );
      }
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

export const blockUser: MutationResolvers<ApolloContext>['blockUser'] = async (
  _parent,
  { userId },
  { db, user },
) => {
  try {
    if (!user?.id) {
      throw new GraphQLError('You must be logged in to block users.');
    }

    const userToBlock = await db.user.findUnique({
      where: { id: userId },
      include: { blockList: true },
    });

    if (!userToBlock?.id || !userId)
      throw new GraphQLError(`Couldn't block user (user not found).`);

    const blockedUser = await db.user.blockUser({
      userId: user?.id,
      targetId: userId,
    });

    if (blockedUser?.id) {
      return blockedUser;
    } else {
      throw new GraphQLError('A problem occured while trying to block user.');
    }
  } catch (error) {
    throw new GraphQLError(error);
  }
};

export const unblockUser: MutationResolvers<ApolloContext>['unblockUser'] =
  async (_parent, { userId }, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('User not logged in');
      }

      const unblockedUser = await db.user.unblockUser({
        userId: user?.id,
        targetId: userId,
      });

      if (unblockedUser?.id) {
        return unblockedUser;
      } else {
        throw new GraphQLError(
          'A problem occured while trying to unblock user.',
        );
      }
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

import { Prisma, User } from '@prisma/client';
import {
  MutationCreateUserArgs,
  SearchResult,
} from '../../src/graphql/generated/graphql';
import * as bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { Order } from '../types';
import db from '../../src/graphql/context';

// Read

export const UserExtension = Prisma.defineExtension({
  name: 'User',
  model: {
    user: {
      // Read
      async getAllUserFollowersSortedByDate<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
        handle: string,
      ): Promise<[User]> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.UserFindManyArgs = {
          // Find users whose 'following' includes a user with this handle
          where: { following: { some: { handle: { equals: handle } } } },
          orderBy: { createdAt: order },
          include: { following: true, followers: true },
        };

        limit && (q.take = limit);
        offset && (q.skip = offset);

        const result: [User] = await (context as any).findMany(q);
        return result;
      },
      async getAllUserFollowingSortedByDate<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
        handle: string,
      ): Promise<[User]> {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.UserFindManyArgs = {
          // Find users whose 'followers' includes a user with this handle
          where: { followers: { some: { handle: { equals: handle } } } },
          orderBy: { createdAt: order },
          include: { following: true, followers: true },
        };

        limit && (q.take = limit);
        offset && (q.skip = offset);

        const result: [User] = await (context as any).findMany(q);
        return result;
      },
      async getUserByEmail<T>(this: T, { email }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.UserFindUniqueArgs = {
          where: { email },
          include: { tweets: true, retweets: true },
        };
        const results: User = await (context as any).findUnique(q);
        return results;
      },
      async searchUsersAndCount<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
        q: string,
      ): Promise<SearchResult> {
        const context = Prisma.getExtensionContext(this);
        const query: Prisma.UserFindManyArgs = {
          orderBy: { createdAt: order },
          include: {
            followers: true,
            following: true,
          },
        };

        const where = {
          OR: [
            {
              name: { contains: q },
              handle: { contains: q },
            },
          ],
        };

        query.where = where;
        limit && (query.take = limit);
        offset && (query.skip = offset);

        const [result, count] = await db.$transaction([
          (context as any).findMany(query),
          (context as any).count({ where }),
        ]);

        return { result, count };
      },
      async getByHandle<T>(this: T, handle: string) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.UserFindFirstArgs = {
          where: { handle: { equals: handle, mode: 'insensitive' } },
          include: {
            posts: { include: { tweet: true, retweet: true } },
            following: true,
            followers: true,
            likes: true,
            blockList: true,
            blockerList: true,
          },
        };
        const results: User = await (context as any).findFirst(q);
        return results;
      },
      // Create
      async createUser<T>(
        this: T,
        {
          email,
          handle,
          name,
          password,
          avatarId,
          isPrivate = false,
        }: MutationCreateUserArgs,
      ) {
        const context = Prisma.getExtensionContext(this);
        // hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const q: Prisma.UserCreateArgs = {
          data: {
            email,
            handle,
            name,
            isPrivate,
            password: hashedPassword,
            // Associate as an avatar and an upload by the user
            avatar: avatarId ? { connect: { id: avatarId } } : undefined,
            media: avatarId ? { connect: { id: avatarId } } : undefined,
          },
        };

        const result: User = await (context as any).create(q);

        return result;
      },
      // Update
      async followUser<T>(this: T, { userId, targetId }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.UserUpdateArgs = {
          where: { id: userId },
          data: { following: { connect: { id: targetId } } },
        };
        const result: User = await (context as any).update(q);
        return result;
      },
      async unfollowUser<T>(this: T, { userId, targetId }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.UserUpdateArgs = {
          where: { id: userId },
          data: { following: { disconnect: { id: targetId } } },
        };
        const result: User = await (context as any).update(q);
        return result;
      },
      async blockUser<T>(this: T, { userId, targetId }) {
        const context = Prisma.getExtensionContext(this);

        const qBlock: Prisma.UserUpdateArgs = {
          where: { id: userId },
          data: { 
            blockList: { connect: { id: targetId } },
            following: { disconnect: { id: userId } },
          },
        };
        
        const qUnfollow: Prisma.UserUpdateArgs = {
          where: { id: userId },
          data: { following: { disconnect: { id: targetId } } },
        };

        const unfollowResult: User = await (context as any).update(qUnfollow);
        const result: User = await (context as any).update(qBlock);
        return result;
      },
      async unblockUser<T>(this: T, { userId, targetId }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.UserUpdateArgs = {
          where: { id: userId },
          data: { blockList: { disconnect: { id: targetId } } },
        };
        const result: User = await (context as any).update(q);
        return result;
      },
    },
  },
});

export default UserExtension;

import { PrismaClient, Notification, User as PrismaUser } from '@prisma/client';
import TweetExtension from '../../prisma/utils/tweet';
import PostExtension from '../../prisma/utils/post';
import UserExtension from '../../prisma/utils/user';
import LikeExtension from '../../prisma/utils/like';
import InteractionExtension from '../../prisma/utils/interaction';
import NotificationExtension from '../../prisma/utils/notification';
import RetweetExtension from '../../prisma/utils/retweet';
import { Response } from 'express';
import MediaExtension from '../../prisma/utils/media';

export const prisma = new PrismaClient();

// extend our prisma client instance to define some helpful methods
const extendedPrismaClient = prisma
  .$extends(TweetExtension)
  .$extends(PostExtension)
  .$extends(UserExtension)
  .$extends(LikeExtension)
  .$extends(RetweetExtension)
  .$extends(InteractionExtension)
  .$extends(NotificationExtension)
  .$extends(MediaExtension);

export type ExtendedPrismaClient = typeof extendedPrismaClient;

export interface ApolloContext {
  db: ExtendedPrismaClient;
  user?: Omit<PrismaUser, 'password'>;
  seenPostsCache?: string[];
  res: Response;
}

const db: ExtendedPrismaClient = extendedPrismaClient;

export default db;

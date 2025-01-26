import { Event, Prisma } from '@prisma/client';
import { ApolloContext } from '../context';
import { MutationResolvers, PostType } from '../generated/graphql';
import { createInteraction } from './utils/events';
import { GraphQLError } from 'graphql';
import { notificationQueue } from '../mutations/utils/NotificationQueue';

// Create
export const retweetTweet: MutationResolvers<ApolloContext>['retweetTweet'] =
  async (_parent, args, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('You are not authorized to perform this action.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      const { userId, tweetId } = args;

      // Find tweet to retweet
      const tweet = await db.tweet.findUnique({
        where: { id: tweetId },
        include: {
          author: true,
          post: true,
        },
      });

      if (!tweet?.id)
        throw new GraphQLError(
          'While attempting to retweet: Tweet to retweet was not found.',
        );

      // Check if retweet already exists
      const existingRetweet = await db.retweet.findUnique({
        where: {
          tweetId_userId: {
            tweetId,
            userId,
          },
        },
      });

      if (existingRetweet?.tweetId)
        throw new GraphQLError(
          'While attempting to retweet: You have already retweeted this tweet.',
        );

      // Create retweet and associated post
      const createdRetweet = await db.retweet.createRetweet(args);
      
      if (!createdRetweet?.tweetId)
        throw new GraphQLError(
          'While attempting to retweet: Failed to create retweet.',
        );

      const createdPost = await db.post.createPost({
        authorId: userId,
        type: PostType.Retweet,
        postRetweetTweetId: tweetId,
        postRetweetUserId: userId,
      });

      if (!createdPost?.id)
        throw new GraphQLError(
          'While attempting to retweet: Failed to create post for retweet.',
        );

      // Create Interactions and Notifications
      const { handle: authorHandle, id: authorId } = tweet.author ?? {};

      // Create interaction between retweeter and tweet author
      await createInteraction({
        db,
        originatorId: userId,
        recepientId: authorId,
        postId: tweet.postId,
        type: Event.RETWEET,
      });

      // Push notification to tweet author
      notificationQueue.addEvent({
        recepientId: authorId,
        recepientName: authorHandle,
        originatorId: userId,
        type: Event.RETWEET,
        link: `/tweet/${tweetId}`,
        resourceId: tweet.postId,
        timestamp: Date.now(),
      });

      return tweet;
    } catch (error) {
      throw new GraphQLError(
        `Failed to retweet: ${error.message}`,
        {
          extensions: {
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          },
        },
      );
    }
  };

// Delete
export const unretweetTweet: MutationResolvers<ApolloContext>['unretweetTweet'] =
  async (_parent, args, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('You are not authorized to perform this action.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      const { userId, tweetId } = args;

      // Find tweet being unretweeted
      const tweet = await db.tweet.findUnique({
        where: { id: tweetId },
        include: { author: true },
      });

      if (!tweet?.id)
        throw new GraphQLError(
          'While attempting to unretweet: Tweet to unretweet was not found.',
        );

      // Find existing retweet
      const existingRetweet = await db.retweet.findUnique({
        where: {
          tweetId_userId: {
            tweetId,
            userId,
          },
        },
      });

      if (!existingRetweet?.tweetId)
        throw new GraphQLError(
          'While attempting to unretweet: Retweet not found.',
        );

      // Delete retweet
      await db.retweet.delete({
        where: {
          tweetId_userId: {
            tweetId,
            userId,
          },
        },
      });

      // Delete associated post
      await db.post.delete({
        where: {
          id: existingRetweet.postId,
        },
      });

      return tweet;
    } catch (error) {
      throw new GraphQLError(
        `Failed to unretweet: ${error.message}`,
        {
          extensions: {
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          },
        },
      );
    }
  };

import { Event, PostType, Prisma } from '@prisma/client';
import { ApolloContext } from '../context';
import { MutationResolvers } from '../generated/graphql';
import { createInteraction, createNotification } from './utils/events';
import { GraphQLError } from 'graphql';
import { notificationQueue } from '../mutations/utils/NotificationQueue';

// Create
// Although only Tweets can be liked, we're using postId for the resource due to context (liking a retweet notifies the tweet's author)
export const likePost: MutationResolvers<ApolloContext>['likePost'] = async (
  _parent,
  args,
  { db, user },
) => {
  try {
    if (!user?.id) {
      throw new GraphQLError('You are not authorized to perform this action.', {
        extensions: {
          code: 'FORBIDDEN',
        },
      });
    }

    const { userId, postId } = args;
    // Grab post
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        tweet: true,
        retweet: {
          include: {
            tweet: true,
          },
        },
      },
    });

    if (!post.id)
      throw new GraphQLError(
        'While attempting to like post: Post to like was not found.',
      );

    if (!post.type)
      throw new GraphQLError(
        'While attempting to like post: Post was found, but had no type.',
      );

    // Determine the post representing the tweet to like (the 'container')
    let tweetContainerId;
    let postTweetId;
    switch (post.type) {
      case PostType.RETWEET:
        postTweetId = post.retweet.tweetId;
        tweetContainerId = post.retweet.tweet.postId;
        break;
      case PostType.TWEET:
        postTweetId = post.tweet?.id;
        tweetContainerId = postId;
        break;
    }

    const tweetContainer = await db.post.findUnique({
      where: { id: tweetContainerId },
      include: { tweet: true },
    });

    if (!tweetContainer?.id)
      throw new GraphQLError(
        'While attempting to like post: Post representing tweet to like was not found.',
      );

    const tweet = await db.tweet.findUnique({
      where: { id: postTweetId },
      include: {
        author: true,
        post: {
          include: {
            tweet: true,
          },
        },
      },
    });

    if (!tweet?.id)
      throw new GraphQLError(
        'While attempting to like post: Tweet to like was not found.',
      );

    // Create the Like
    const createdLike = await db.like.createLike({
      userId,
      tweetId: postTweetId,
    });

    if (!createdLike?.tweetId)
      throw new GraphQLError(
        'While attempting to like post: Failed to create like for tweet.',
      );

    // Create Interactions and Notifications based on event
    const { handle: authorHandle, id: authorId } = tweet?.author ?? {};

    // Create interaction between liker and tweet author
    await createInteraction({
      db,
      originatorId: userId,
      recepientId: authorId,
      postId,
      type: Event.LIKE,
    });

    // Push notif to tweet author
    notificationQueue.addEvent({
      recepientId: authorId,
      recepientName: authorHandle,
      originatorId: userId,
      type: Event.LIKE,
      link: `/tweet/${postTweetId}`,
      resourceId: postId,
      timestamp: Date.now(),
    });

    // If liking a retweet and retweeter is not author of liked tweet, do same for retweeter
    if (post.type === PostType.RETWEET) {
      const retweeterId = post.retweet?.userId;

      if (retweeterId !== userId) {
        const retweeter = await db.user.findUnique({
          where: { id: retweeterId },
        });

        // Create interaction between retweeter and liker
        await createInteraction({
          db,
          originatorId: userId,
          recepientId: retweeterId,
          postId,
          type: Event.RETWEET_LIKE,
        });

        // Push notif to retweeter
        notificationQueue.addEvent({
          recepientId: retweeterId,
          recepientName: retweeter?.name,
          originatorId: userId,
          type: Event.RETWEET_LIKE,
          link: `/tweet/${postTweetId}`,
          resourceId: postId,
          timestamp: Date.now(),
        });
      }
    }

    return tweetContainer;
    // TODO: error handling in Apollo
  } catch (error) {
    throw new GraphQLError(error);
  }
};

// Delete
// Deletion is simpler since tweet context is irrelevant. For consistency, naming is kept same.
export const unlikePost: MutationResolvers<ApolloContext>['unlikePost'] =
  async (_parent, args, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError(
          'You are not authorized to perform this action.',
          {
            extensions: {
              code: 'FORBIDDEN',
            },
          },
        );
      }

      const { userId, tweetId } = args;

      const tweet = await db.tweet.findUnique({
        where: { id: tweetId },
        include: {
          author: true,
        },
      });

      if (!tweet?.id)
        throw new GraphQLError(
          'While attempting to unlike post: Tweet to unlike was not found.',
        );

      const tweetContainer = await db.post.findUnique({
        where: { id: tweet.postId },
        include: { tweet: true },
      });

      if (!tweetContainer?.id)
        throw new GraphQLError(
          'While attempting to unlike post: Post representing Tweet to unlike was not found.',
        );

      await db.like.delete({
        where: {
          tweetId_userId: {
            tweetId,
            userId,
          },
        },
      });

      return tweetContainer;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };

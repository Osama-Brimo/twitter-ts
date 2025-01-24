import { Event } from '@prisma/client';
import { ApolloContext } from '../context';
import { MutationResolvers, PostType } from '../generated/graphql';
import { createNotification, createInteraction } from './utils/events';
import { GraphQLError } from 'graphql';
// import { createInteraction } from '../../utils/interaction';
// import { createNotification } from '../../utils/notification';

/**
 * Returns an array of all mentioned users and hashtags from a string.
 *
 * Matches on `@` for mentions, and `#` for hashtags.
 *
 * @param content - The content to extract tags and mentions from.
 * @returns An object containing arrays of matched hashtags and mentions.
 */
const extractTagsAndMentions = (
  content: string,
): { hashtags: string[]; mentions: string[] } => {
  if (typeof content !== 'string') throw new Error('Content must be a string.');

  const hashtags = content.match(/#[\w]+/g) || [];
  const mentions = content.match(/@[\w.]+/g) || [];

  return {
    hashtags: hashtags.map((tag: string) => tag.slice(1)), // Remove # symbol
    mentions: mentions.map((mention: string) => mention.slice(1)), // Remove @ symbol
  };
};

/**
 * Performs all necessary side effects for hashtags and user mentions, such as `Hashtag` instantiation, `Notification`/`Interaction` creation, etc.
 *
 * @param content - string content of the `Tweet`.
 * @param tweetId - The `id` of the `Tweet` the content comes from.
 * @param postId  - The `Post` container of the `Tweet`.
 * @param authorId - `id` of `Tweet` author `User`.
 * @param db - database client instance
 */
const processTagsAndMentions = async (
  content: string,
  tweetId: string,
  postId: string,
  authorId: string,
  db: ApolloContext['db'],
) => {
  try {
    const { hashtags, mentions } = extractTagsAndMentions(content);

    // Process unique hashtags only using Set (removes duplicates)
    const uniqueHashtags = [...new Set(hashtags)];
    const hashtagPromises = uniqueHashtags.map(async (tag) => {
      const hashtag = await db.hashtag.upsert({
        where: { hashtag: tag },
        update: {
          tweets: { connect: { id: tweetId } },
        },
        create: {
          hashtag: tag,
          tweets: { connect: { id: tweetId } },
        },
      });

      if (!hashtag?.id) {
        throw new GraphQLError(`Failed to create or update hashtag: ${tag}`);
      }

      const updatedTweet = await db.tweet.update({
        where: { id: tweetId },
        data: {
          hashtags: {
            connect: { id: hashtag.id },
          },
        },
      });

      if (!updatedTweet?.id) {
        throw new GraphQLError(
          `Failed to connect hashtag ${tag} to tweet ${tweetId}`,
        );
      }
    });

    // Process unique mentions only
    const uniqueMentions = [...new Set(mentions)];
    const mentionPromises = uniqueMentions.map(async (handle) => {
      // Find mentioned user (case insensitive)
      const mentionedUser = await db.user.findFirst({
        where: { handle: { equals: handle, mode: 'insensitive' } },
      });

      if (!mentionedUser?.id) {
        console.warn(`Mentioned user not found: ${handle}`);
        return;
      }

      // Find mentioner from provided authorId
      const mentionerUser = await db.user.findUnique({
        where: { id: authorId },
      });

      if (!mentionerUser?.id) {
        throw new GraphQLError(
          'Failed to find mentioner user while processing mentions.',
        );
      }

      // Create interaction for the mention
      await createInteraction({
        db,
        originatorId: authorId,
        recepientId: mentionedUser.id,
        postId,
        type: Event.MENTION,
      });

      // Create notification for mentioned user
      await createNotification({
        db,
        recepientId: mentionedUser.id,
        recepientName: mentionedUser.handle,
        originatorId: authorId,
        type: Event.MENTION,
        link: `/tweet/${tweetId}`,
      });
    });

    // Wait for all to resolve
    await Promise.all([...hashtagPromises, ...mentionPromises]).catch((err) => {
      console.error(
        '[processTagsAndMentions]: Error while resolving hashtag and mention promises.',
        err,
      );
      throw new GraphQLError(
        'Failed to process hashtags and mentions. Please try again.',
      );
    });
  } catch (error) {
    console.error('[processTagsAndMentions]: Error:', error);
    throw error;
  }
};

export const createTweet: MutationResolvers<ApolloContext>['createTweet'] =
  async (_parent, args, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('You must be logged in to create Tweets.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      const { content, authorId } = args;

      if (authorId !== user.id) {
        throw new GraphQLError('Cannot create tweet for another user.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      const createdTweet = await db.tweet.createTweet(args);
      if (!createdTweet?.id) {
        throw new GraphQLError('Failed to create tweet.');
      }

      const createdPost = await db.post.createPost({
        authorId: args.authorId,
        type: PostType.Tweet,
        postTweetId: createdTweet.id,
      });

      if (!createdPost?.id) {
        // Cleanup tweet if post creation fails
        await db.tweet.delete({ where: { id: createdTweet.id } });
        throw new GraphQLError('Failed to create post for tweet.');
      }

      // Process hashtags and mentions
      await processTagsAndMentions(
        content,
        createdTweet.id,
        createdPost.id,
        authorId,
        db,
      );

      return createdPost;
    } catch (error) {
      console.error('[createTweet]: Error:', error);
      if (error instanceof GraphQLError) {
        throw error;
      }
      throw new GraphQLError('Failed to create tweet. Please try again.');
    }
  };

export const deleteTweet: MutationResolvers<ApolloContext>['deleteTweet'] =
  async (_parent, { authorId, tweetId, postId }, { db, user }) => {
    try {
      if (!user?.id) {
        throw new GraphQLError('You must be logged in to delete tweets.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      if (user.id !== authorId) {
        throw new GraphQLError('You can only delete your own tweets.', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      const tweetContainer = await db.post.findUnique({
        where: { id: postId },
      });

      if (!tweetContainer?.id)
        throw new GraphQLError('Could not find Post representing tweet while attempting to delete tweet.');

      const deletedTweet = await db.tweet.deleteTweet({ tweetId, authorId });
      if (!deletedTweet?.id) {
        throw new GraphQLError('Failed to delete tweet.');
      }

      const deletedPost = deletedTweet;

      return deletedPost;
    } catch (error) {
      console.error('[deleteTweet]: Error:', error);
      if (error instanceof GraphQLError) {
        throw error;
      }
      throw new GraphQLError('Failed to delete tweet. Please try again.');
    }
  };

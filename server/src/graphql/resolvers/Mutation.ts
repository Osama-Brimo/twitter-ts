import { ApolloContext } from '../context';
import { MutationResolvers } from '../generated/graphql';
import {
  createUser,
  loginUser,
  logoutUser,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
} from '../mutations/User';
import { createTweet, deleteTweet } from '../mutations/Tweet';
import { likePost, unlikePost } from '../mutations/Like';
import { retweetTweet, unretweetTweet } from '../mutations/Retweet';
import { createMedia, deleteManyMedia } from '../mutations/Media';
import {
  deleteNotification,
  markNotificationsAsSeen,
} from '../mutations/Notification';
import { deletePost } from '../mutations/Post';

const Mutation: MutationResolvers<ApolloContext> = {
  // User
  createUser,
  loginUser,
  logoutUser,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  // Tweet
  createTweet,
  deleteTweet,
  // Like
  likePost,
  unlikePost,
  // Retweet
  retweetTweet,
  unretweetTweet,
  // Notification
  markNotificationsAsSeen,
  deleteNotification,
  // Media
  createMedia,
  deleteManyMedia,
  // Post
  deletePost,
};

export default Mutation;

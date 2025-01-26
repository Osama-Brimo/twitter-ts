import { ApolloContext } from '../context';
import { QueryResolvers } from '../generated/graphql';
import {
  currentUser,
  userByHandle,
  allUserFollowing,
  allUserFollowers,
  searchUsersAndCount,
  findCommonBetweenUsers,
  getUserSuggestions,
} from '../queries/User';
import {
  allPosts,
  allUserPosts,
  getPostWithReplies,
  searchPostsAndCount,
} from '../queries/Post';
import { allUserLikes } from '../queries/Like';
import {
  getHashtag,
  searchHashtagsAndCount,
  getTrendingHashtags,
} from '../queries/Hashtag';

const Query: QueryResolvers<ApolloContext> = {
  // User
  currentUser,
  userByHandle,
  findCommonBetweenUsers,
  getUserSuggestions,
  // Post
  getPostWithReplies,
  allPosts,
  allUserPosts,
  allUserLikes,
  allUserFollowers,
  allUserFollowing,
  // SearchResult
  searchPostsAndCount,
  searchUsersAndCount,
  searchHashtagsAndCount,
  // Hashtag
  getHashtag,
  getTrendingHashtags,
};

export default Query;

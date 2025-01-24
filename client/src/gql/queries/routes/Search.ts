import { gql } from "@apollo/client";
import { POST_INFO_FRAGMENT, USER_INFO_FRAGMENT } from "../components/tweet/Tweet";

export const searchPosts = gql`
  query searchPostsAndCount($q: String, $hashtag: String, $includeRetweets: Boolean, $offset: Int, $limit: Int) {
    searchPostsAndCount(q: $q, hashtag: $hashtag, includeRetweets: $includeRetweets offset: $offset, limit: $limit) {
      count
      result {
        ...PostInfoFragment
        ...UserInfoFragment
        ... on Hashtag {
          id
          kind
          hashtag
          tweetCount
        }
      }
    }
  }

  ${POST_INFO_FRAGMENT}
  ${USER_INFO_FRAGMENT}
`;

export const searchUsers = gql`
  query searchUsersAndCount($q: String, $offset: Int, $limit: Int) {
    searchUsersAndCount(q: $q, offset: $offset, limit: $limit) {
      count
      result {
        ...PostInfoFragment
        ...UserInfoFragment
        ... on Hashtag {
          id
          kind
          hashtag
          tweetCount
        }
      }
    }
  }

  ${POST_INFO_FRAGMENT}
  ${USER_INFO_FRAGMENT}
`;

export const searchHashtags = gql`
  query searchHashtagsAndCount($q: String, $offset: Int, $limit: Int) {
    searchHashtagsAndCount(q: $q, offset: $offset, limit: $limit) {
      count
      result {
        ...PostInfoFragment
        ...UserInfoFragment
        ... on Hashtag {
          id
          kind
          hashtag
          tweetCount
        }
      }
    }
  }

  ${POST_INFO_FRAGMENT}
  ${USER_INFO_FRAGMENT}
`;

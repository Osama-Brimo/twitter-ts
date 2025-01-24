import { gql } from "@apollo/client";
import { LIKE_INFO_FRAGMENT, POST_INFO_FRAGMENT, USER_INFO_FRAGMENT } from "../../components/tweet/Tweet";
import { PROFILE_HEADER_FRAGMENT } from "../../components/profile/ProfileHeader";

export const allUserPosts = gql`
  query allUserPosts($handle: String, $offset: Int, $limit: Int) {
    allUserPosts(handle: $handle, offset: $offset, limit: $limit) {
      ...PostInfoFragment
    }
  }

  ${POST_INFO_FRAGMENT}
`;

export const allUserLikes = gql`
  query allUserLikes($handle: String, $offset: Int, $limit: Int) {
    allUserLikes(handle: $handle, offset: $offset, limit: $limit) {
      ...LikeInfoFragment
    }
  }

  ${LIKE_INFO_FRAGMENT}
`;

export const allUserFollowers = gql`
  query allUserFollowers($handle: String, $offset: Int, $limit: Int) {
    allUserFollowers(handle: $handle, offset: $offset, limit: $limit) {
      ...UserInfoFragment
    }
  }

  ${USER_INFO_FRAGMENT}
`;

export const allUserFollowing = gql`
  query allUserFollowing($handle: String, $offset: Int, $limit: Int) {
    allUserFollowing(handle: $handle, offset: $offset, limit: $limit) {
      ...UserInfoFragment
    }
  }

  ${USER_INFO_FRAGMENT}
`;

export const userByHandle = gql`
  query userByHandle($handle: String ) {
    userByHandle(handle: $handle) {
      ...ProfileHeaderFragment
    }
  }

  ${PROFILE_HEADER_FRAGMENT}
`;

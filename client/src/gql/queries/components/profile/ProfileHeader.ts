import { gql } from '@apollo/client';

export const PROFILE_HEADER_FRAGMENT = gql`
  fragment ProfileHeaderFragment on User {
    id
    name
    handle
    bio
    website
    createdAt
    isPrivate
    _followed
    _follower
    avatar {
      url
    }
    followers {
      id
    }
    following {
      id
    }
    blockList {
      id
    }
  }
`;

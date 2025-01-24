import { gql } from '@apollo/client';

// Create
export const createUser = gql`
  mutation createUser(
    $email: String!
    $password: String!
    $handle: String!
    $name: String!
    $avatarId: UUID
    $isPrivate: Boolean
  ) {
    createUser(
      email: $email
      password: $password
      handle: $handle
      name: $name
      avatarId: $avatarId
      isPrivate: $isPrivate
    ) {
      token
      user {
        id
        name
        email
        handle
        bio
        website
        isPrivate
        avatar {
          url
        }
        notifications {
          id
          createdAt
          type
          message
          seen
          squashedCount
          link
          participants {
            id
            name
            handle
            avatar {
              url
            }
          }
        }
        tweets {
          id
        }
        retweets {
          userId
          tweetId
          tweet {
            id
          }
        }
      }
    }
  }
`;

export const loginUser = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        handle
        bio
        website
        isPrivate
        avatar {
          url
        }
        notifications {
          id
          createdAt
          type
          message
          seen
          squashedCount
          link
          participants {
            id
            name
            handle
            avatar {
              url
            }
          }
        }
        tweets {
          id
        }
        retweets {
          userId
          tweetId
          tweet {
            id
          }
        }
      }
    }
  }
`;

export const logoutUser = gql`
  mutation logoutUser {
    logoutUser
  }
`;

export const followUser = gql`
  mutation followUser($userId: UUID!) {
    followUser(userId: $userId) {
      id
      followers {
        id
      }
      following {
        id
      }
      _followed
    }
  }
`;

export const unfollowUser = gql`
  mutation unfollowUser($userId: UUID!) {
    unfollowUser(userId: $userId) {
      id
      followers {
        id
      }
      following {
        id
      }
      _followed
    }
  }
`;

export const blockUser = gql`
  mutation blockUser($userId: UUID!) {
    blockUser(userId: $userId) {
      id
      blockList {
        id
      }
      _blocked
    }
  }
`;

export const unblockUser = gql`
  mutation unblockUser($userId: UUID!) {
    unblockUser(userId: $userId) {
      id
      blockList {
        id
      }
      _blocked
    }
  }
`;
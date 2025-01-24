import { gql } from '@apollo/client';

export const newNotificationSubscription = gql`
  subscription newNotification($userId: UUID!) {
    newNotification(userId: $userId) {
      id
      createdAt
      message
      type
      seen
      squashedCount
      participants {
        id
        name
        handle
        bio
        avatar {
          url
        }
        createdAt
        _blocked
        _followed
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
    }
  }
`;

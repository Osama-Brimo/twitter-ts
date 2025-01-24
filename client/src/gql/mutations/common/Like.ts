import { gql } from '@apollo/client';

// Create
export const likePost = gql`
  mutation likePost($userId: UUID!, $postId: UUID!, $retweeterId: UUID) {
    likePost(userId: $userId, postId: $postId, retweeterId: $retweeterId) {
      id
      tweet {
        id
        likeCount
        _liked
      }
    }
  }
`;

// Delete
export const unlikePost = gql`
  mutation unlikePost($userId: UUID!, $tweetId: UUID!) {
    unlikePost(userId: $userId, tweetId: $tweetId) {
      id
      tweet {
        id
        likeCount
        _liked
      }
    }
  }
`;

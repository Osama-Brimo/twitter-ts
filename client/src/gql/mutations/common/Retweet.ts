import { gql } from "@apollo/client";

// Create
export const retweetTweet = gql`
  mutation retweetTweet($userId: UUID!, $tweetId: UUID!) {
    retweetTweet(userId: $userId, tweetId: $tweetId) {
      id
      postId
      retweetCount
      _retweeted
    }
  }
`;

// Delete
export const unretweetTweet = gql`
  mutation UnretweetTweet($userId: UUID!, $tweetId: UUID!) {
    unretweetTweet(userId: $userId, tweetId: $tweetId) {
      id
      postId
      retweetCount
      _retweeted
    }
  }
`;
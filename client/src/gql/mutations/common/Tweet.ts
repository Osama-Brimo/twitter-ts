import { POST_INFO_FRAGMENT } from "@/gql/queries/components/tweet/Tweet";
import { gql } from "@apollo/client";

// Create
export const createTweet = gql`
  mutation createTweet(
    $authorId: UUID!
    $content: String!
    $media: [UUID]
    $replyOf: UUID
    $quoteOf: UUID
  ) {
    createTweet(
      authorId: $authorId
      content: $content
      media: $media
      replyOf: $replyOf
      quoteOf: $quoteOf
    ) {
      ...PostInfoFragment
    }
  }

  ${POST_INFO_FRAGMENT}
`;

// Delete
export const deleteTweet = gql`
  mutation deleteTweet($authorId: UUID!, $tweetId: UUID!, $postId: UUID!) {
    deleteTweet(authorId: $authorId, tweetId: $tweetId, postId: $postId) {
      id
    }
  }
`;

// Update
export const markTweetsAsSeen = gql`
  mutation markTweetsAsSeen($tweetIds: [UUID!]!) {
    markTweetsAsSeen(tweetIds: $tweetIds)
  }
`;
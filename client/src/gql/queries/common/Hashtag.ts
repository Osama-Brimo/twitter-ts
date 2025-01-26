import { gql } from "@apollo/client";

export const getTrendingHashtags = gql`
query getTrendingHashtags {
  getTrendingHashtags {
    id
    hashtag
    tweetCount
  }
}
`;

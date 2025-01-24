import { gql } from "@apollo/client";

export const getHashtag = gql`
  query getHashtag($hashtag: String) {
    getHashtag(hashtag: $hashtag) {
      id
      hashtag
      tweets {
        id
      }
      tweetCount
    }
  }`;

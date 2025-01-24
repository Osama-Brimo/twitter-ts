import { gql } from '@apollo/client';
import { POST_INFO_FRAGMENT } from '../components/tweet/Tweet';

// TODO: query/mutation names are probably inconsistent, clean up later. Probably queryNameQuery/mutationNameMuation
export const userPostsQuery = gql`
  query userPosts {
    userPosts {
      id
      tweets {
        id
        content
        likeCount
        retweetCount
        replyCount
        author {
          id
          name
          handle
          bio
          createdAt
          followers {
            id
          }
          following {
            id
          }
        }
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
`;

export const getPostWithRepliesQuery = gql`
  query getPostWithReplies($id: UUID!) {
    getPostWithReplies(id: $id) {
      ...PostInfoFragment
    }
  }
  
  ${POST_INFO_FRAGMENT}
`;

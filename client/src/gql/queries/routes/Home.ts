import { gql } from "@apollo/client";
import { POST_INFO_FRAGMENT } from "../components/tweet/Tweet";


export const allPosts = gql`
  query allPosts($offset: Int, $limit: Int) {
    allPosts(offset: $offset, limit: $limit) {
      ...PostInfoFragment
    }
  }

  ${POST_INFO_FRAGMENT}
`;

import { gql } from "@apollo/client";

export const deletePost = gql`
  mutation deletePost($authorId: UUID!, $postId: UUID!) {
    deletePost(authorId: $authorId, postId: $postId) {
      id
    }
  }
`;
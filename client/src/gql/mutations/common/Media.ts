import { gql } from '@apollo/client';

export const createMedia = gql`
  mutation createMedia(
    $key: String!
    $filename: String!
    $mimetype: String!
    $extension: String!
    $size: NonNegativeInt!
    $uploaderId: UUID
    $tweetId: UUID
    $asAvatar: Boolean
  ) {
    createMedia(
      key: $key
      filename: $filename
      mimetype: $mimetype
      extension: $extension
      size: $size
      uploaderId: $uploaderId
      tweetId: $tweetId
      asAvatar: $asAvatar
    ) {
      id
      key
      filename
      extension
      tweetId
      uploaderId
      uploader {
        id
      }
      avatarUser {
        id
      }
    }
  }
`;

export const deleteManyMedia = gql`
  mutation deleteManyMedia($mediaIds: [UUID!]!) {
    deleteManyMedia(mediaIds: $mediaIds) {
      id
      key
    }
  }
`;

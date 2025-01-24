import { gql } from '@apollo/client';

export const USER_INFO_FRAGMENT = gql`
  fragment UserInfoFragment on User {
    id
    name
    handle
    bio
    isPrivate
    avatar {
      url
    }
    createdAt
    _blocked
    _followed
    _follower
    followers {
      id
    }
    following {
      id
    }
    blockList {
      id
    }
    blockerList {
      id
    }
  }
`;

export const MEDIA_INFO_FRAGMENT = gql`
  fragment MediaInfoFragment on Media {
    id
    key
    filename
    url
    tweetId
    uploaderId
  }
`;

// A Tweet (n) should always include its children (...nN) and their children's ids (...nN+1), regardless of query.
export const TWEET_INFO_FRAGMENT = gql`
  fragment TweetInfoFragment on Tweet {
    id
    createdAt
    content
    likeCount
    retweetCount
    replyCount
    _liked
    _retweeted
    authorId
    postId
    meta {
      id
      galleryType
    }
    author {
      ...UserInfoFragment
    }
    likes {
      userId
      tweetId
    }
    retweets {
      userId
      tweetId
    }
    quoting {
      id
      content
      meta {
        id
        galleryType
      }
      author {
        id
        name
        handle
        isPrivate
        avatar {
          url
        }
      }
    }
    quoteId
    media {
      ...MediaInfoFragment
    }
    parentId
    parent {
      id
      content
      likeCount
      retweetCount
      replyCount
      _liked
      _retweeted
      authorId
      meta {
        id
        galleryType
      }
      author {
        ...UserInfoFragment
      }
      postId
      media {
        ...MediaInfoFragment
      }
    }
    children {
    # (...nN)
      id
      content
      likeCount
      retweetCount
      replyCount
      _liked
      _retweeted
      authorId
      postId
      parentId
      author {
        ...UserInfoFragment
      }
      children {
        # (...nN+1)
        id
        parentId
      }
      meta {
        id
        galleryType
      }
      media {
        ...MediaInfoFragment
      }
      post {
        id
      }
      author {
        ...UserInfoFragment
      }
    }
  }
`;

export const POST_INFO_FRAGMENT = gql`
  ${USER_INFO_FRAGMENT}
  ${TWEET_INFO_FRAGMENT}
  ${MEDIA_INFO_FRAGMENT}

  fragment PostInfoFragment on Post {
    id
    _seen
    type
    createdAt
    updatedAt
    authorId
    author {
      ...UserInfoFragment
    }
    tweet {
      ...TweetInfoFragment
    }
    retweet {
      createdAt
      userId
      user {
        ...UserInfoFragment
      }
      tweetId
      tweet {
        ...TweetInfoFragment
      }
    }
  }
`;

export const LIKE_INFO_FRAGMENT = gql`
  ${USER_INFO_FRAGMENT}
  ${TWEET_INFO_FRAGMENT}

  fragment LikeInfoFragment on Like {
    createdAt
    userId
    user {
      id
      handle
      isPrivate
    }
    tweetId
    tweet {
      ...TweetInfoFragment
    }
  }
`;

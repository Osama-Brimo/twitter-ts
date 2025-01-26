import { gql } from '@apollo/client';
import { USER_INFO_FRAGMENT } from '../components/tweet/Tweet';

export const currentUser = gql`
  query currentUser {
    currentUser {
      id
      name
      email
      handle
      bio
      website
      isPrivate
      avatar {
        url
      }
      followers {
        id
      }
      following {
        id
        name
        handle
      }
      blockList {
        id
      }
      blockerList {
        id
      }
      notifications {
        id
        createdAt
        type
        message
        seen
        squashedCount
        link
        participants {
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
          followers {
            id
            isPrivate
          }
          following {
            id
            isPrivate
          }
          blockList {
            id
            isPrivate
          }
        }
      }
      tweets {
        id
      }
      retweets {
        userId
        tweetId
      }
    }
  }
`;

export const userProfile = gql`
  fragment userInfo on User {
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
    followers {
      id
    }
    following {
      id
    }
    blockList {
      id
    }
  }

  fragment tweetInfo on Tweet {
    id
    content
    likeCount
    retweetCount
    _liked
    _retweeted
    authorId
    author {
      ...userInfo
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
      author {
        id
        name
        handle
        avatar {
          url
        }
      }
    }
    quoteId
  }

  query userProfile {
    currentUser {
      id
      name
      email
      handle
      bio
      website
      avatar {
        url
      }
      followers {
        id
      }
      following {
        id
      }
      followers {
        id
      }
      following {
        id
        name
        handle
      }
      blockList {
        id
      }
      blockerList {
        id
      }
    }
  }
`;

export const findCommonBetweenUsers = gql`
  query findCommonBetweenUsers(
    $handleA: String
    $handleB: String
    $intersectionUserType: IntersectionUserTypes
  ) {
    findCommonBetweenUsers(
      handleA: $handleA
      handleB: $handleB
      intersectionUserType: $intersectionUserType
    ) {
      ...UserInfoFragment
    }
  }

  ${USER_INFO_FRAGMENT}
`;

export const getUserSuggestions = gql`
query getUserSuggestions {
  getUserSuggestions {
    ...UserInfoFragment
  }
}

${USER_INFO_FRAGMENT}
`;

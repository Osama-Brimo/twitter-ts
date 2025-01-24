import { gql } from '@apollo/client';
import { USER_INFO_FRAGMENT } from '../components/tweet/Tweet';

export const tweetWithReplies = gql`
  query tweetWithReplies(
    $handleA: String
    $handleB: String
    $intersectionUserType: IntersectionUserTypes
  ) {
    tweetWithReplies(
      handleA: $handleA
      handleB: $handleB
      intersectionUserType: $intersectionUserType
    ) {
      ...UserInfoFragment
    }
  }

  ${USER_INFO_FRAGMENT}
`;

import { gql } from "@apollo/client";
import { USER_INFO_FRAGMENT } from "./tweet/Tweet";

export const userByHandle = gql`
  query userByHandle($handle: String) {
    userByHandle(handle: $handle) {
        ...UserInfoFragment
    }
  }

  ${USER_INFO_FRAGMENT}
`;

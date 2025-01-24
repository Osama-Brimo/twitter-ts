import { gql } from '@apollo/client';

// Update
export const markNotificationsAsSeen = gql`
  mutation markNotificationsAsSeen($notificationIds: [UUID!]!) {
    markNotificationsAsSeen(notificationIds: $notificationIds)
  }
`;
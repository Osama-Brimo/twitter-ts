import { gql } from "@apollo/client";

export const deleteNotification = gql`
  mutation deleteNotification($notificationId: UUID!) {
    deleteNotification(notificationId: $notificationId) {
      id
    }
  }
`;
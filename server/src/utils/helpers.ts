/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Event } from '@prisma/client';
import { Notification } from '../graphql/generated/graphql';

// A user readable message of the event.
// the resource will be in the link of the notification.
export function createNotificationMessage(
  notification: Notification
): string {
  if (!notification?.id || !notification.participants?.length) return null;

  const participantCount = notification.participants.length;
  const firstParticipant = notification.participants[0];
  let result: string;

  switch (notification.type) {
    case Event.LIKE:
      result = participantCount > 1
        ? `${firstParticipant.name} and ${participantCount - 1} others liked your tweet`
        : `${firstParticipant.name} liked your tweet`;
      break;
    case Event.FOLLOW:
      result = participantCount > 1
        ? `${firstParticipant.name} and ${participantCount - 1} others followed you`
        : `${firstParticipant.name} followed you`;
      break;
    case Event.MENTION:
      result = participantCount > 1
        ? `${firstParticipant.name} and ${participantCount - 1} others mentioned you in their tweet`
        : `${firstParticipant.name} mentioned you in their tweet`;
      break;
    case Event.QUOTE:
      result = participantCount > 1
        ? `${firstParticipant.name} and ${participantCount - 1} others quoted your tweet`
        : `${firstParticipant.name} quoted your tweet`;
      break;
    case Event.REPLY:
      result = participantCount > 1
        ? `${firstParticipant.name} and ${participantCount - 1} others replied to your tweet`
        : `${firstParticipant.name} replied to your tweet`;
      break;
    case Event.RETWEET:
      result = participantCount > 1
        ? `${firstParticipant.name} and ${participantCount - 1} others retweeted you`
        : `${firstParticipant.name} retweeted you`;
      break;
      case Event.RETWEET_LIKE:
      result = participantCount > 1
        ? `${firstParticipant.name} and ${participantCount - 1} others liked your retweet`
        : `${firstParticipant.name} liked your retweet`;
      break;
    default:
      break;
  }

  return result;
}
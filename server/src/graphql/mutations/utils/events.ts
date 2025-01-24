import { Notification } from '@prisma/client';
import { ExtendedPrismaClient } from '../../context';
import { Event } from '../../generated/graphql';
import { PubSub } from 'graphql-subscriptions';

export const notificationPubsub = new PubSub();

interface createInteractionArgs {
  db: ExtendedPrismaClient;
  originatorId: string;
  recepientId: string;
  postId: string;
  type: Event;
}

interface createNotificationArgs {
  db: ExtendedPrismaClient;
  originatorId: string;
  recepientId: string;
  recepientName: string;
  link: string;
  type: Event;
  resourceId: string;
  participants: { id: string }[];
  squashedCount: number;
}

async function publishNotification(userId: string, notification: Notification) {
  try {
    const channel = `NEW_NOTIFICATION_${userId}`;
    console.log('Publishing notification to channel:', channel, notification);
    await notificationPubsub.publish(channel, {
      newNotification: notification,
    });
  } catch (error) {
    console.error('Error publishing notification:', error);
  }
}

export const createInteraction = async ({
  db,
  originatorId,
  recepientId,
  postId,
  type,
}: createInteractionArgs) => {
  const interactionArgs = {
    postId,
    originatorId,
    recepientId,
    type,
  };

  // Exception: ignore if user interacts with self
  if (originatorId === recepientId) return null;

  const newInteraction =
    await db.interaction.createInteraction(interactionArgs);

  return newInteraction;
};

export const createNotification = async ({
  db,
  originatorId,
  recepientId,
  link,
  type,
  resourceId,
  participants,
  squashedCount,
}: createNotificationArgs) => {
  console.log('Creating notification:', {
    originatorId,
    recepientId,
    type,
    link,
    resourceId,
    participants,
    squashedCount,
  });

  if (originatorId === recepientId) {
    console.log('Skipping notification: originator is recipient');
    return null;
  }

  const newNotification = await db.notification.create({
    data: {
      user: { connect: { id: recepientId } },
      participants: { connect: participants },
      link,
      type,
      resourceId,
      squashedCount,
    },
    include: { participants: true },
  });

  console.log('New notification:', newNotification);

  // Publish notification to the user
  await publishNotification(recepientId, newNotification);

  return newNotification;
};

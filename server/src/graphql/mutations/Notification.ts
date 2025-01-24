import { GraphQLError } from 'graphql';
import { ApolloContext } from '../context';
import { MutationResolvers } from '../generated/graphql';

// Update
export const markNotificationsAsSeen: MutationResolvers<ApolloContext>['markNotificationsAsSeen'] =
  async (_parent, args, { db }) => {
    try {
      const success = await db.notification.markNotificationsAsSeen(args);
      return success;
    } catch (error) {
      console.error('Error in markNotificationsAsSeen resolver:', error);
      throw new GraphQLError('Error marking notifications as seen');
    }
  };

  export const deleteNotification: MutationResolvers<ApolloContext>['deleteNotification'] =
  async (_parent, { notificationId }, { db }) => {
    try {
      const deleted = await db.notification.delete({ where: { id: notificationId } });

      if (!deleted?.id) throw new GraphQLError(`Failed to delete notification.`);

      return deleted;
    } catch (error) {
      throw new GraphQLError(error);
    }
  };
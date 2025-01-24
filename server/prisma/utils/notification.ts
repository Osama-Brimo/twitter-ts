import { Notification, Prisma } from '@prisma/client';

export const NotificationExtension = Prisma.defineExtension({
  name: 'Notification',
  model: {
    notification: {
      // Create
      async createNotification<T>(this: T, { userId, link, type }) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.NotificationCreateArgs = {
          data: {
            user: { connect: { id: userId } },
            link,
            type,
          },
        };
        const results: Notification = await (context as any).create(q);
        return results;
      },
      // Update
      async markNotificationsAsSeen<T>(this: T, { notificationIds }) {
        console.log(notificationIds, 'from markNotificationsAsSeen extension');
        const context = Prisma.getExtensionContext(this);
        try {
          const q: Prisma.NotificationUpdateManyArgs = {
            where: { id: { in: notificationIds } },
            data: { seen: true },
          };
          const results = await (context as any).updateMany(q);
          console.log(
            'Results from markNotificationsAsSeen extension:',
            results,
          );
          return results.count > 0;
        } catch (error) {
          console.error('Error in markNotificationsAsSeen:', error);
          return false; // Return false instead of throwing an error
        }
      },
    },
  },
});

export default NotificationExtension;

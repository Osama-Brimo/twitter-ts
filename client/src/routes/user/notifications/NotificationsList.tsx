import { useMutation, useSubscription } from '@apollo/client';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import SingleNotification from '@/components/notifications/SingleNotification';
import { Notification } from '@/gql/graphql';
import { markNotificationsAsSeen as markNotificationsAsSeenMutation } from '@/gql/mutations/common/Notification.js';
import { newNotificationSubscription } from '@/gql/subscriptions/Notification';
import { useUser } from '@/context/UserProvider';
import { currentUser } from '@/gql/queries/common/User.js';
import { get } from 'lodash';

interface NotificationsListProps {
  filterUnread?: boolean;
}

const NotificationsList = ({ filterUnread = false }: NotificationsListProps) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: newNotificationData } = useSubscription(
    newNotificationSubscription,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
      onError: (err) => {
        console.error('Subscription error:', err);
        toast(err.message);
      },
    },
  );

  const [markNotificationsAsSeen] = useMutation(
    markNotificationsAsSeenMutation,
    {
      onError: (err) => {
        console.error('Mutation error:', err);
        toast(err.message);
      },
      update: (cache, { data }) => {
        if (data?.markNotificationsAsSeen) {
          const userData = cache.readQuery({ query: currentUser });
          const notifications = get(userData, 'currentUser.notifications', []);
          const updatedNotifications = notifications.map((notification) => ({
            ...notification,
            seen: true,
          }));
          cache.writeQuery({
            query: currentUser,
            data: {
              currentUser: {
                ...get(userData, 'currentUser', {}),
                notifications: updatedNotifications,
              },
            },
          });
        }
      },
    },
  );

  useEffect(() => {
    if (user?.notifications) {
      const filteredNotifications = user.notifications
        .filter((n): n is Notification => n !== null)
        .filter(n => !filterUnread || !n.seen);
      setNotifications(filteredNotifications);
    }
  }, [user, filterUnread]);

  useEffect(() => {
    if (newNotificationData?.newNotification) {
      setNotifications((prev) => [
        newNotificationData.newNotification,
        ...prev,
      ]);
    }
  }, [newNotificationData]);

  useEffect(() => {
    return () => {
      const unseenNotifications = notifications
        .filter((n) => !n.seen)
        .map((n) => n.id);

      if (unseenNotifications.length > 0) {
        markNotificationsAsSeen({
          variables: { notificationIds: unseenNotifications },
        });
      }
    };
  }, [notifications, markNotificationsAsSeen]);

  if (!notifications?.length)
    return (
      <p className="text-muted-foreground text-center my-8">
        <b>Nothing here yet.</b>
      </p>
    );

  return (
    <div>
      {notifications.map((notification) => (
        <SingleNotification
          key={notification?.id}
          notification={notification}
        />
      ))}
    </div>
  );
};

export default NotificationsList;

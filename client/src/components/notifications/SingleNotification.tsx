import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/gql/graphql';
import UserAvatar from '@/components/app/UserAvatar';
import NotificationDropdownMenu from '@/components/notifications/buttons/NotificationDropdownMenu';

interface SingleNotificationProps {
  notification: Notification;
}

const SingleNotification = ({ notification }: SingleNotificationProps) => {
  const { seen, message, createdAt, link } = notification;
  const firstParticipant = notification.participants[0] ?? null;
  const navigate = useNavigate();

  return (
    <div className="mb-4 p-6 last:mb-0 flex justify-between hover:bg-accent/30 cursor-pointer">
      {!seen && (
        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
      )}
      <div
        className="flex items-center space-x-2"
        onClick={() => {
          if (link) navigate(link);
        }}
      >
        <div className="mx-1">
          {firstParticipant ? (
            <UserAvatar user={firstParticipant} withIdentifiers={false} />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{message}</p>
          <p className="text-sm text-muted-foreground">
            {moment(createdAt).fromNow()}
          </p>
        </div>
      </div>
      <NotificationDropdownMenu data={notification} />
    </div>
  );
};

export default SingleNotification;

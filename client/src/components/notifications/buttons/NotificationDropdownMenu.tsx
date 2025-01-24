import { Button } from '@/components/app/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BellOff, MoreHorizontal, TrashIcon } from 'lucide-react';
import type { Notification } from '@/gql/graphql';
import { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { deleteNotification as deleteNotificationMutation } from '@/gql/mutations/components/notifications/buttons/NotificationDropdownMenu';
import { toast } from 'sonner';

interface NotificationDropdownMenuProps {
  data: Notification;
}

const NotificationDropdownMenu = ({ data }: NotificationDropdownMenuProps) => {
  const [deleteNotification] = useMutation(deleteNotificationMutation);

  // TODO: Implement the logic to turn off similar notifications
  const handleTurnOffSimilar = useCallback(() => {
    console.log('Turn off similar notifications for:', data.type);
    // Implement the mutation to update user preferences
  }, [data]);

  const handleDelete = useCallback(async () => {
    try {
      const variables = {
        notificationId: data.id,
      };
      await deleteNotification({
        variables,
        onCompleted() {
          console.log('[handleDelete]: deleted notification successfully.');
        },
        update(cache, { data: deleteNotificationMutationResult }) {
          const deletedNotif = deleteNotificationMutationResult as Notification;
          cache.evict({ id: cache.identify({ __typename: 'Notification', __ref: deletedNotif.id }) });
          cache.gc();
        }
      });
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    }
  }, [data, deleteNotification]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <MoreHorizontal className="h-3.5 w-3.5" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleTurnOffSimilar}>
          <BellOff size="15" className="mr-1" />
          Turn off similar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>
          <TrashIcon size="15" className="mr-1" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdownMenu;

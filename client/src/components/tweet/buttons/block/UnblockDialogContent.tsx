import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import type {
  MutationUnblockUserArgs,
  User,
  User as UserType,
} from '@/gql/graphql.js';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { unblockUser as unblockUserMutation } from '@/gql/mutations/common/User';
import { useCallback } from 'react';

interface UnblockDialogContentProps {
  targetUser: UserType;
  onClose: () => void;
}

const UnblockDialogContent = ({ targetUser, onClose }: UnblockDialogContentProps) => {
  const { id, handle, _blocked } = targetUser ?? {};

  // Hooks
  const [unblockUser] = useMutation(unblockUserMutation);

  // Handlers
  const handleUnblock = useCallback(async () => {
    try {
      if (id && _blocked) {
        const variables: MutationUnblockUserArgs = {
          userId: id,
        };
        await unblockUser({
          variables,
          onCompleted: () => {
            onClose();
            toast.success(`@${handle} unblocked.`);
          },
          update(cache, { data }) {
            const updatedUser = data.unblockUser as User;

            // Update currentUser in the cache
            cache.modify({
              id: cache.identify(updatedUser),
              fields: {
                blockList: (prev) => {
                  if (prev?.length) {
                    return prev.filter((u: User) => u.id !== targetUser.id);
                  }
                  return null;
                },
              },
            });
            // Update the targetUser in the cache
            cache.modify({
              id: cache.identify(targetUser),
              fields: {
                blockerList: () => updatedUser.blockerList,
                _blocked: () => false,
              },
            });
          },
        });
      }
    } catch (error) {
      onClose();
      console.error(
        `[handleUnfollow]: Error while trying to unblock user ${handle}`,
        error,
      );
      toast.error('Something went wrong. Please try again later');
    }
  }, [_blocked, handle, id, onClose, targetUser, unblockUser]);

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Unblock @{handle}?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to unblock @{handle}? Their posts will be visible, and they'll be able to follow you, interact with you, and see your posts.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleUnblock}>Unblock</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default UnblockDialogContent;

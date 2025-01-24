import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserProvider';
import { User } from '@/gql/graphql';
import { blockUser as blockUserMutation } from '@/gql/mutations/common/User';
import { useMutation } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface BlockDialogContentProps {
  targetUser: User;
}

const BlockDialogContent = ({ targetUser }: BlockDialogContentProps) => {
  // GraphQL
  const { user: currentUser } = useUser();
  const [blockUser] = useMutation(blockUserMutation);

  const { id, handle, _blocked } = targetUser ?? {};

  const isSelf = useMemo(() => currentUser?.id === id, [currentUser, id]);

  // Handlers
  const handleBlock = useCallback(async () => {
    try {
      if (id && !isSelf && !_blocked) {
        await blockUser({
          variables: {
            userId: targetUser.id,
          },
          update(cache, { data }) {
            const updatedUser = data.blockUser as User;

            // Update currentUser in the cache
            cache.modify({
              id: cache.identify(currentUser as User),
              fields: {
                blockList: (prev) => {
                  if (prev?.length) {
                    return [updatedUser, ...prev];
                  }
                  return null;
                },
                following: (prev) => {
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
                _blocked: () => true,
                followers: () => updatedUser.followers,
                _followed: () => false,
              },
            });
          },
          onCompleted: () => {
            toast.success(`@${handle} was blocked.`);
          },
        });
      }
    } catch (error) {
      console.error(
        `[handleFollow]: Error while attempting to block user @${handle}`,
        error,
      );
      toast.error('Something went wrong. Please try again later.');
    }
  }, [_blocked, blockUser, currentUser, handle, id, isSelf, targetUser]);

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Block @{handle}?</AlertDialogTitle>
        <AlertDialogDescription>
          Blocking this user will unfollow them. They will also no longer be
          able to see your posts, interact with you, or follow you. They will
          not be notified.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleBlock}> Block </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default BlockDialogContent;

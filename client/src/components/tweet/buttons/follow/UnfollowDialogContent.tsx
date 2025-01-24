import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import type {
  MutationUnfollowUserArgs,
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
import { unfollowUser as unfollowUserMutation } from '@/gql/mutations/common/User.js';
import { useCallback } from 'react';

interface UnfollowDialogContentProps {
  targetUser: UserType;
}

const UnfollowDialogContent = ({ targetUser }: UnfollowDialogContentProps) => {
  const { id, handle } = targetUser ?? {};

  // Hooks
  const [unfollowUser] = useMutation(unfollowUserMutation);

  // Handlers
  const handleUnfollow = useCallback(async () => {
    try {
      if (id) {
        const variables: MutationUnfollowUserArgs = {
          userId: id,
        };
        await unfollowUser({
          variables,
          update(cache, { data }) {
            const updatedUser = data.unfollowUser as User;

            // Update currentUser in the cache
            cache.modify({
              id: cache.identify(updatedUser),
              fields: {
                following: (prev) => {
                  if (prev?.length) {
                    return prev.filter((u: User) => u.id !== targetUser.id)
                  }
                  return null;
                },
              },
            });
            // Update the targetUser in the cache
            cache.modify({
              id: cache.identify(targetUser),
              fields: {
                followers: () => updatedUser.followers,
                _followed: () => false,
              },
            });
          },
          onCompleted: () => {
            toast.success(`Unfollowed @${handle}.`);
          },
        });
      }
    } catch (error) {
      console.error(
        `[handleUnfollow]: Error while trying to unfollow user ${handle}`,
        error,
      );
      toast.error('Something went wrong. Please try again later');
    }
  }, [handle, id, targetUser, unfollowUser]);

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Unfollow @{handle}?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to unfollow @{handle}? They won't be notified.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleUnfollow}>Unfollow</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default UnfollowDialogContent;

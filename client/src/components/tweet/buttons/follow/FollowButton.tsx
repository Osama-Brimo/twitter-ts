import { useMutation } from '@apollo/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/app/Button';
import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserProvider';
import { followUser as followUserMutation } from '@/gql/mutations/common/User.js';
import type { User, User as UserType } from '@/gql/graphql';
import { Styles } from '@/lib/types';
import UnfollowDialogContent from '@/components/tweet/buttons/follow/UnfollowDialogContent';
import UnblockDialogContent from '../block/UnblockDialogContent';
import { useNavigate } from 'react-router-dom';

interface FollowButtonProps {
  targetUser: UserType;
}

enum FollowButtonLabel {
  FOLLOW = 'Follow',
  FOLLOWING = 'Following',
  FOLLOW_BACK = 'Follow Back',
  BLOCKED = 'Blocked',
  BLOCKING = 'Blocking',
  REQUEST_FOLLOW = 'Request Follow',
  UNFOLLOW = 'Unfollow',
  UNBLOCK = 'Unblock',
}

enum FollowButtonVariant {
  DEFAULT = 'default',
  SECONDARY = 'secondary',
  DESTRUCTIVE = 'destructive',
}

const styles: Styles = {
  button: {
    width: '200px',
    minWidth: 'max-content',
  },
};

const FollowButton = ({ targetUser }: FollowButtonProps) => {
  // Vars
  const { user: currentUser } = useUser();
  const { id, handle, _followed, _follower, _blocked, _blocker, isPrivate } =
    targetUser ?? {};

  const navigate = useNavigate();
  const isSelf = useMemo(() => currentUser?.id === id, [currentUser?.id, id]);

  // Hooks

  // State
  const [label, setLabel] = useState<FollowButtonLabel>(
    FollowButtonLabel.FOLLOW,
  );

  // Memoized Values
  const buttonVariant = useMemo(() => {
    if (_blocker || _blocked) return FollowButtonVariant.DESTRUCTIVE;
    if (_followed) return FollowButtonVariant.SECONDARY;
    return FollowButtonVariant.DEFAULT;
  }, [_blocked, _blocker, _followed]);

  const initialLabel = useMemo(() => {
    if (_blocker) return FollowButtonLabel.BLOCKED;
    if (_blocked) return FollowButtonLabel.BLOCKING;
    if (_followed) return FollowButtonLabel.FOLLOWING;
    if (!_followed && isPrivate) return FollowButtonLabel.REQUEST_FOLLOW;
    if (_follower && !_followed) return FollowButtonLabel.FOLLOW_BACK;
    return FollowButtonLabel.FOLLOW;
  }, [_blocked, _blocker, _followed, _follower, isPrivate]);

  const hoverLabel = useMemo(() => {
    if (_blocker) return FollowButtonLabel.BLOCKED;
    if (_blocked) return FollowButtonLabel.UNBLOCK;
    if (_followed) return FollowButtonLabel.UNFOLLOW;
    return initialLabel;
  }, [_blocked, _blocker, _followed, initialLabel]);

  // Effects
  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  // GraphQL
  const [followUser] = useMutation(followUserMutation);

  // Handlers
  const handleFollow = useCallback(async () => {
    try {
      if (!currentUser?.id) {
        navigate('/login');
        return;
      }
      if (targetUser?.id && !isSelf) {
        await followUser({
          variables: {
            userId: targetUser.id,
          },
          update(cache, { data }) {
            const updatedUser = data.followUser as User;

            // Update currentUser in the cache
            cache.modify({
              id: cache.identify(currentUser as User),
              fields: {
                following: (prev) => {
                  if (prev?.length) {
                    return [updatedUser, ...prev];
                  }
                  return [updatedUser];
                },
              },
            });
            // Update the targetUser in the cache
            cache.modify({
              id: cache.identify(targetUser),
              fields: {
                following: () => updatedUser.following,
                _followed: () => true,
              },
            });
          },
          onCompleted: () => {
            toast.success('User followed!');
          },
        });
      }
    } catch (error) {
      console.error(
        `[handleFollow]: Error while attempting to follow user ${handle}`,
        error,
      );
      toast.error('Something went wrong. Please try again later.');
    }
  }, [currentUser, followUser, handle, isSelf, navigate, targetUser]);

  const handleMouseEnter = () => {
    setLabel(hoverLabel);
  };

  const handleMouseLeave = () => {
    setLabel(initialLabel);
  };

  if (isSelf) return;

  if (_followed) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant={buttonVariant}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={styles.button}
          >
            {label}
          </Button>
        </AlertDialogTrigger>
        <UnfollowDialogContent targetUser={targetUser} />
      </AlertDialog>
    );
  }

  if (_blocked) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant={buttonVariant}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={styles.button}
          >
            {label}
          </Button>
        </AlertDialogTrigger>
        <UnblockDialogContent targetUser={targetUser} />
      </AlertDialog>
    );
  }

  return (
    <Button
      size="sm"
      disabled={_blocker}
      variant={buttonVariant}
      onClick={handleFollow}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={styles.button}
    >
      {label}
    </Button>
  );
};

export default FollowButton;

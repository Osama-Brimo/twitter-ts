import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type User as UserType } from '../../gql/graphql';
import { CalendarDays, LockKeyholeIcon } from 'lucide-react';
import FollowButton from '../tweet/buttons/follow/FollowButton';
import { useUser } from '../../context/UserProvider';
import { readableDate } from '../../lib/helpers';
import { useLazyQuery } from '@apollo/client';
import { findCommonBetweenUsers } from '@/gql/queries/common/User';
import { useEffect, useMemo, useState } from 'react';
import AvatarStack from './AvatarStack';
import { Badge } from '../ui/badge';
import SkeletonContent from './SkeletonContent';
interface UserCardProps {
  user: UserType;
  isVisible?: boolean;
}

const UserCard = ({ user, isVisible = false }: UserCardProps) => {
  const { user: currentUser } = useUser() ?? {};
  const {
    createdAt,
    avatar,
    handle,
    name,
    bio,
    _follower,
    followers,
    following,
    isPrivate,
  } = user ?? {};

  const [getQuery] = useLazyQuery(findCommonBetweenUsers);
  const [commonFollowers, setCommonFollowers] = useState<UserType[]>([]);

  const shouldFetchCommonFollowers = useMemo(() => {
    const loggedIn = currentUser?.id;
    const notSelf = currentUser?.id !== user?.id;
    const hasFollowers = followers?.length;
    return loggedIn && notSelf && isVisible && hasFollowers;
  }, [currentUser, followers, isVisible, user]);

  useEffect(() => {
    if (shouldFetchCommonFollowers) {
      console.log('the test passed dude....');
      getQuery({
        variables: {
          handleA: currentUser?.handle,
          handleB: user?.handle,
          intersectionUserType: 'Followers',
        },
        onError: (err) => {
          console.error(err);
        },
        onCompleted: (d) => {
          console.log(`Common Followers query ran:`, d);
          setCommonFollowers(d.findCommonBetweenUsers);
        },
      });
    }
  }, [currentUser, getQuery, shouldFetchCommonFollowers, user]);

  if (!user?.id) return <SkeletonContent type="user" />;

  return (
    <div className="flex space-x-4">
      <Avatar className="h-12 w-12 flex">
        <AvatarImage src={avatar?.url} alt="Avatar" />
        <AvatarFallback>{user?.name?.at(0)?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="space-y-1 mt-3">
        <div>
          <div>
            <strong>{name}</strong>
            {isPrivate && (
              <Badge>
                <LockKeyholeIcon size="16" />
              </Badge>
            )}
          </div>
          <div>
            <small className="text-xs text-muted-foreground">@{handle}</small>
          </div>
        </div>
        <div>
          {currentUser && _follower ? (
            <Badge variant="secondary" className="mb-3">
              Follows you
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-pretty text-slate-400">
          { bio }
        </p>
        <div className="flex py-3">
          <p className="text-sm font-semibold mr-2 text-nowrap">
            Following {following?.length ?? 0}
          </p>
          <p className="text-sm font-semibold text-nowrap">
            Followers {followers?.length ?? 0}
          </p>
        </div>
        {commonFollowers.length ? (
          <div>
            <AvatarStack users={commonFollowers} />
          </div>
        ) : null}
        {createdAt && (
          <div className="flex items-center pt-2">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '}
            <span className="text-xs text-muted-foreground">
              Joined on {readableDate(createdAt)}
            </span>
          </div>
        )}
      </div>
      {currentUser && user?.id !== currentUser?.id && (
        <FollowButton targetUser={user} />
      )}
    </div>
  );
};

export default UserCard;

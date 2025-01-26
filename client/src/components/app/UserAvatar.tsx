import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import type { User as UserType } from '../../gql/graphql';
import UserCard from './UserCard';
import SkeletonContent from './SkeletonContent';
import { useState } from 'react';
import { LockIcon, LockKeyholeIcon } from 'lucide-react';
import { Badge } from '../ui/badge';

interface UserAvatarProps {
  user: UserType;
  withIdentifiers?: boolean;
  date?: string;
}

const UserAvatar = ({
  user,
  withIdentifiers = false,
  date,
}: UserAvatarProps) => {
  // Vars
  const { avatar, handle, name } = user ?? {};
  const [isUserCardVisible, setIsUserCardVisible] = useState(false);

  const enterHandler = () => {
    console.log('visibility on');
    setIsUserCardVisible(true);
  };

  const leaveHandler = () => {
    console.log('visibility off');
    setIsUserCardVisible(false);
  };
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className="flex align-middle justify-between"
          onMouseEnter={enterHandler}
          onMouseLeave={leaveHandler}
        >
          <Link to={`/user/${handle}`}>
            <div className="flex">
              <Avatar className="h-12 w-12 flex select-none">
                <AvatarImage src={avatar?.url} alt="Avatar" />
                <AvatarFallback>{user?.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {withIdentifiers && (
                <div className="pl-4 my-auto">
                  <span className=" font-semibold leading-none pr-2">
                    {name}
                  </span>
                  <small className="text-sm text-muted-foreground">
                    <span>{handle ? `@${handle}` : null}</span>
                    <span> • {date}</span>
                  </small>
                </div>
              )}
            </div>
          </Link>
        </div>
      </HoverCardTrigger>
      <HoverCardContent style={{ minWidth: '25rem' }}>
        {user?.id ? (
          <UserCard user={user} isVisible={isUserCardVisible} />
        ) : (
          <SkeletonContent type="user" />
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserAvatar;

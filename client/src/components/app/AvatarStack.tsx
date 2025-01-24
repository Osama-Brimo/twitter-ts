import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type User as UserType } from '../../gql/graphql';

interface AvatarStackProps {
  users: UserType[];
  label?: string;
}

const AvatarStack = ({ users, label }: AvatarStackProps) => {
  const userCount = useMemo(() => users.length, [users]);
  const displayUsers = useMemo(() => users.slice(0, 3), [users]);
  const remainingCount = userCount > 3 ? userCount - 3 : 0;

  const makeFallbackName = (s: string) =>
    s
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() ?? 'U';

  return (
    <div
      className="flex text-sm text-muted-foreground"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>
        <small>
          Followed by{' '}
          <strong className="text-primary">{displayUsers[0].name}</strong>
          {remainingCount > 0 && `+${remainingCount} others`}
        </small>
      </div>
      <div className="flex">
        {displayUsers.map((user, index) => (
            // TODO: [frontend] clean up user avatar styles later
          <Avatar key={user.id} className="dark:border-1 dark:border-white scale-75">
            <AvatarImage src={user?.avatar?.url} alt={`${user.name}'s avatar`} />
            <AvatarFallback>{makeFallbackName(user?.name)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
};

export default AvatarStack;

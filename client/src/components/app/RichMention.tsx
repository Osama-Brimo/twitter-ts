import { Link } from 'react-router-dom';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import type { User as UserType } from '../../gql/graphql';
import UserCard from './UserCard';
import { useLazyQuery } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { userByHandle } from '@/gql/queries/components/RichMention';
import SkeletonContent from './SkeletonContent';

interface RichMentionProps {
  handle: string;
}

const RichMention = ({ handle }: RichMentionProps) => {
  const [getUserByHandle, { data, loading }] = useLazyQuery(userByHandle);
  const [mentioned, setMentioned] = useState<UserType>();

  const [isUserCardVisible, setIsUserCardVisible] = useState(false);

  const enterHandler = () => {
    console.log('visibility on');
    setIsUserCardVisible(true);
  };

  const leaveHandler = () => {
    console.log('visibility off');
    setIsUserCardVisible(false);
  };

  useEffect(() => {
    if (data) {
      setMentioned(data.userByHandle);
    }
  }, [data]);

  const queryHandler = useCallback(async () => {
    await getUserByHandle({
      variables: { handle },
      onError: (err) => {
        console.error(err);
      },
      onCompleted: (d) => {
        console.log(`[userByHandle] data:`, d);
        setMentioned(d.userByHandle);
      },
      notifyOnNetworkStatusChange: true,
    });
  }, [getUserByHandle, handle]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild onMouseEnter={queryHandler}>
        <Link
          onMouseEnter={enterHandler}
          onMouseLeave={leaveHandler}
          to={`/user/${handle}`}
          className="text-blue-400 underline font-bold"
        >
          {`@${handle}`}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        style={{
          minWidth: mentioned?.id ? '25rem' : 'none',
          // 'revert' causes issues on width, undefined works better
          textAlign: !mentioned?.id ? 'center' : undefined,
          width: !mentioned?.id ? 'auto' : undefined,
        }}
      >
        {loading && <SkeletonContent type="user" />}
        {mentioned?.id ? (
          <UserCard user={mentioned} isVisible={isUserCardVisible} />
        ) : (
          <small className="text-muted-foreground">User not found</small>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default RichMention;

import { QueryResult, useLazyQuery } from '@apollo/client';
import { allPosts } from '../../src/gql/queries/routes/Home';
import { toast } from 'sonner';
import Feed from '../components/app/feed/Feed';
import TweetBox from '../components/app/tweetbox/TweetBox';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { HomeFeedTypes } from '../lib/types';
import { useUser } from '../context/UserProvider';
import HomeFeedNavTabs from '../components/app/NavTabs';

// First update the type to be more specific
type HomeFeedQueryHandlers = {
  handleFeedForYou: (force?: boolean) => Promise<void>;
  handleFeedDiscover: () => void;
  handleFeedFollowing: () => void;
};

const Home = () => {
  const { user } = useUser();

  const [getAllPosts, allPostsQueryResult] = useLazyQuery(allPosts, {
    fetchPolicy: 'cache-first',
  });

  const [query, setQuery] = useState(allPosts);
  const [feedType, setFeedType] = useState<HomeFeedTypes>('foryou');
  const [feedQueryResult, setFeedQueryResult] =
    useState<QueryResult>(allPostsQueryResult);
  const [feedQueryName, setFeedQueryName] = useState<string>('allPosts');

  useEffect(() => {
    console.log('[Home.tsx]: feedQueryResult changed:', feedQueryResult);
  }, [feedQueryResult]);

  const handleFeedForYou = useCallback(
    async (force = false) => {
      if (force || feedType !== 'foryou') {
        await getAllPosts({
          variables: { offset: 0, limit: 15 },
          onError: (err) => {
            console.error(err);
            toast(err.message);
          },
          onCompleted: () => {
            setFeedType('foryou');
          },
          notifyOnNetworkStatusChange: true,
        });
      }
    },
    [getAllPosts, feedType],
  );

  const handleFeedDiscover = useCallback(() => {
    if (feedType !== 'discover') {
      setFeedType('discover');
    }
  }, [feedType]);

  const handleFeedFollowing = useCallback(() => {
    if (feedType !== 'following') {
      setFeedType('following');
    }
  }, [feedType]);

  const queryHandlers: HomeFeedQueryHandlers = useMemo(
    () => ({
      handleFeedForYou,
      handleFeedDiscover,
      handleFeedFollowing,
    }),
    [handleFeedDiscover, handleFeedFollowing, handleFeedForYou],
  );

  useEffect(() => {
    switch (feedType) {
      case 'foryou':
        setQuery(allPosts);
        setFeedQueryName('allPosts');
        setFeedQueryResult(allPostsQueryResult);
        break;
      case 'discover':
        break;
      case 'following':
        break;
      default:
        setQuery(allPosts);
        setFeedQueryName('allPosts');
        setFeedQueryResult(allPostsQueryResult);
        break;
    }
  }, [allPostsQueryResult, feedType]);

  // run intial query on mount (for you if logged in, discover otherwise)
  useEffect(() => {
    const { handleFeedForYou } = queryHandlers;
    if (user?.id) {
      handleFeedForYou(true);
    } else {
      handleFeedForYou(true);
    }
  }, [getAllPosts, queryHandlers, user]);

  return (
    <Feed
      itemType="post"
      displayType="post"
      query={query}
      queryName={feedQueryName}
      queryResult={feedQueryResult}
    >
      <TweetBox context={'post'} query={query} queryName={feedQueryName} />
      {user?.id && (
        <HomeFeedNavTabs queryHandlers={queryHandlers} value={feedType} />
      )}
    </Feed>
  );
};

export default Home;

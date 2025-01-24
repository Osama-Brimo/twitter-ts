import { useState, useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Loader2 } from 'lucide-react';
import SkeletonContent from '../SkeletonContent';
// import { type Post as PostType } from '../../../gql/graphql';
// import { type User as UserType } from '../../../gql/graphql';
// import { type Media as MediaType } from '../../../gql/graphql';
import { FeedProps } from '@/lib/types';
import DisplayPostFeed from './DisplayPostFeed';
import DisplayUserFeed from './DisplayUserFeed';
import DisplayMediaFeed from './DisplayMediaFeed';

const Feed = ({
  displayType,
  itemType,
  query,
  queryName,
  queryResult,
  queryIsSearch = false,
  fetchMoreVars,
  itemsPerPage = 15,
  feedLabel,
  showCount,
  children,
}: FeedProps) => {
  // Vars
  const { loading, data, fetchMore, error } = queryResult;

  // State
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const items = useMemo(() => {
    if (data) {
      return queryIsSearch ? data[queryName]?.result : data[queryName];
    }
    return [];
  }, [data, queryIsSearch, queryName]);

  const handleMore = useCallback(async () => {
    console.log(`[handleMore]: triggered...`);
    if (!hasMore || isFetchingMore) return;
    try {
      console.log(`[handleMore]: fetching...`);
      setIsFetchingMore(true);
      const result = await fetchMore({
        variables: {
          ...fetchMoreVars,
          offset: items.length,
          limit: itemsPerPage,
        },
      });

      const moreQueryItems = queryIsSearch
        ? result.data[queryName]?.result
        : result.data[queryName];

      if (moreQueryItems.length < itemsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more tweets:', error);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  }, [
    fetchMore,
    fetchMoreVars,
    hasMore,
    isFetchingMore,
    itemsPerPage,
    items,
    queryIsSearch,
    queryName,
  ]);

  if (error) {
    return <div>Failed to load tweets.</div>;
  }

  const LoadingSpinner = () =>
    loading && (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
      {children}
      {items?.length ? (
        <InfiniteScroll
          dataLength={items?.length}
          next={handleMore}
          hasMore={hasMore}
          loader={
            isFetchingMore ? (
              <>
                <LoadingSpinner />
                <SkeletonContent type="card" repeat={3} />
              </>
            ) : null
          }
          endMessage={
            <p className="text-muted-foreground text-center my-8">
              <b>No more posts to show</b>
            </p>
          }
        >
          {feedLabel && (
            <p className="text-xl my-3 ml-2">
              <b>{feedLabel}</b>
              <b className="ml-2 text-sm text-muted-foreground">{`(${items?.length} total)`}</b>
            </p>
          )}
          {displayType === 'post' && (
            <DisplayPostFeed
              loading={loading}
              query={query}
              queryName={queryName}
              items={items}
              itemType={itemType}
            />
          )}
          {displayType === 'user' && (
            <DisplayUserFeed
              loading={loading}
              query={query}
              queryName={queryName}
              items={items}
            />
          )}
          {displayType === 'media' && (
            <DisplayMediaFeed
              loading={loading}
              query={query}
              queryName={queryName}
              items={items}
            />
          )}
        </InfiniteScroll>
      ) : (
        <>
          {loading ? (
            <SkeletonContent type="card" repeat={4} />
          ) : (
            <p
              className={`text-muted-foreground text-center my-8 py-40`}
            >
              <b>Nothing here yet</b>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;

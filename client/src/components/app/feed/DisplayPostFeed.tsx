import { useCallback, useEffect } from 'react';
import { getDisplayDataFromPost } from '@/lib/helpers';
import {
  DisplayPostItem,
  FeedDisplayItemTypes,
  TweetDisplay,
  TweetMetaInfo,
} from '@/lib/types';
import Tweet from '@/components/tweet/Tweet';
import SkeletonContent from '@/components/app/SkeletonContent';
import { DocumentNode } from 'graphql';
import { Post } from '@/gql/graphql';

interface DisplayPostFeedProps {
  loading: boolean;
  query: DocumentNode;
  queryName: string;
  items: DisplayPostItem[];
  itemType: FeedDisplayItemTypes;
}

const DisplayPostFeed = ({
  loading,
  query,
  queryName,
  items,
  itemType = 'post',
}: DisplayPostFeedProps) => {
  const getItemDisplayDataByType = useCallback(
    (item: DisplayPostItem): TweetDisplay => {
      const meta: TweetMetaInfo = {
        query,
        queryName,
      };
      switch (itemType) {
        case 'tweet':
          return {
            key: item?.id,
            tweet: item,
            meta: { ...meta, postId: item.postId },
          };
        case 'like':
          return {
            key: item?.tweetId,
            tweet: item?.tweet,
            meta: { ...meta, postId: item?.tweet?.postId, query, queryName },
          };
        case 'post':
          return getDisplayDataFromPost(item as Post, query, queryName);
        default:
          // TODO: this is probably bad, but type problem
          return getDisplayDataFromPost(item as Post, query, queryName);
      }
    },
    [itemType, query, queryName],
  );

  useEffect(() => {
    console.log('the items given to DisplayPostFeed', items);
  }, [items]);

  return (
    <div className="grid gap-2">
      {loading && !items?.length ? (
        <SkeletonContent type="card" repeat={3} />
      ) : (
        <>
          {items?.map((item) => {
            const displayData = getItemDisplayDataByType(item);
            return (
              <Tweet
                key={displayData?.key}
                tweet={displayData?.tweet}
                meta={displayData?.meta}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default DisplayPostFeed;

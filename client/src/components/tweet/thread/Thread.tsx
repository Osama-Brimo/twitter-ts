import {
  type Tweet as TweetType,
} from '@/gql/graphql';
import Tweet from '../Tweet.js';
import { TweetMetaInfo, TweetPreviewContext } from '@/lib/types';
import { useMemo } from 'react';

interface ThreadProps {
  tweet: TweetType;
}

const Thread = ({ tweet }: ThreadProps) => {
  const replies = useMemo(() => tweet?.children ?? [], [tweet]) as TweetType[];

  if (!replies?.length) return;

  return (
    <div className='mt-12'>
      <h2>Tweet Replies</h2>
      <div className="">
        {replies.map((reply) => {
          const meta: TweetMetaInfo = {
            postId: reply?.postId,
            previewContext: TweetPreviewContext.reply,
          };

          return (
            <div className="my-3" key={reply.id}>
              <Tweet tweet={reply} meta={meta} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Thread;

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tweet as TweetType } from '@/gql/graphql';
import Tweet from '@/components/tweet/Tweet';
import TweetBox from '@/components/app/tweetbox/TweetBox';
import { TweetMetaInfo, TweetPreviewContext } from '@/lib/types';

interface ReplyDialogContentProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const ReplyDialogContent = ({ data, meta }: ReplyDialogContentProps) => {
  const { query, queryName } = meta ?? {};
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Reply</DialogTitle>
      </DialogHeader>
      <Tweet
        meta={{ ...meta, previewContext: TweetPreviewContext.quoteDialog }}
        tweet={data}
      />
      <div className="mt-5"></div>
      <DialogDescription>
        <span className="mr-1">Replying to</span>
        <span>
          <a href={`/${data?.author?.handle}`}>{data?.author?.handle}</a>
        </span>
      </DialogDescription>
      <TweetBox
        context="reply"
        replyOf={data}
        query={query}
        queryName={queryName}
      />
    </DialogContent>
  );
};

export default ReplyDialogContent;

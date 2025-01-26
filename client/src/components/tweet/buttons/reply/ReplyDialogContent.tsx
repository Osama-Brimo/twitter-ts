import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tweet as TweetType } from '@/gql/graphql';
import Tweet from '@/components/tweet/Tweet';
import TweetBox from '@/components/app/TweetBox/TweetBox';
import { TweetMetaInfo, TweetPreviewContext } from '@/lib/types';
import { Link } from 'react-router-dom';

interface ReplyDialogContentProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const ReplyDialogContent = ({ data, meta }: ReplyDialogContentProps) => {
  const { author } = data ?? {};
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
      <DialogDescription>
        <span className="mr-1">Replying to</span>
        <Link to={`/user/${author?.handle}`}>@{author?.handle}</Link>
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

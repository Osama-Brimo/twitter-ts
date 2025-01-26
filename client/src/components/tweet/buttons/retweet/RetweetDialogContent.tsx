import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tweet as TweetType } from '@/gql/graphql';
import TweetBox from '@/components/app/TweetBox/TweetBox';
import Tweet from '@/components/tweet/Tweet';
import { TweetMetaInfo, TweetPreviewContext } from '@/lib/types';
import { Link } from 'react-router-dom';

interface RetweetDialogContentProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const RetweetDialogContent = ({ data, meta }: RetweetDialogContentProps) => {
  const { author } = data ?? {};
  const { query, queryName } = meta ?? {};
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Quote</DialogTitle>
        <DialogDescription>
          <span className="mr-1">Quoting</span>
          <Link to={`/user/${author?.handle}`}>@{author?.handle}</Link>
        </DialogDescription>
      </DialogHeader>
      <TweetBox
        context="quote"
        quoteOf={data?.id}
        query={query}
        queryName={queryName}
      />
      <Tweet
        meta={{ ...meta, previewContext: TweetPreviewContext.quoteDialog }}
        tweet={data}
      />
    </DialogContent>
  );
};

export default RetweetDialogContent;

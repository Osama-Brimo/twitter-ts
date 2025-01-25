import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tweet as TweetType } from '@/gql/graphql';
import TweetBox from '@/components/app/tweetbox/TweetBox';
import Tweet from '@/components/tweet/Tweet';
import { TweetMetaInfo, TweetPreviewContext } from '@/lib/types';

interface RetweetDialogContentProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const RetweetDialogContent = ({ data, meta }: RetweetDialogContentProps) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Quote</DialogTitle>
        <DialogDescription>
          Quoting <a href={`/${data?.author?.handle}`}>{data?.author?.handle}</a>
        </DialogDescription>
      </DialogHeader>
      <TweetBox context="quote" quoteOf={data?.id} />
      <Tweet meta={{ ...meta ,previewContext: TweetPreviewContext.quoteDialog }} tweet={data} />
    </DialogContent>
  );
};

export default RetweetDialogContent;

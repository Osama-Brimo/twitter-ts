import { useLazyQuery } from '@apollo/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getHashtag } from '@/gql/queries/components/RichHashtag';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

interface RichHashtagProps {
  hashtag: string;
  content: string;
}

const RichHashtag = ({ hashtag, content }: RichHashtagProps) => {
  const [getHashtagQuery, { data, loading }] = useLazyQuery(getHashtag);
  const [tweetCount, setTweetCount] = useState<number>();

  useEffect(() => {
    if (data) {
      setTweetCount(data.getHashtag.tweetCount);
    }
  }, [data]);

  const queryHandler = useCallback(async () => {
    await getHashtagQuery({
      variables: { hashtag },
      onError: (err) => {
        console.error(err);
      },
      onCompleted: (d) => {
        console.log(`[getHashtag]: result for hashtag:`, d);
        setTweetCount(d.getHashtag?.tweetCount);
      },
      notifyOnNetworkStatusChange: true,
    });
  }, [getHashtagQuery, hashtag]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild onMouseEnter={queryHandler}>
          <Link
            to={`/search?hashtag=${hashtag}`}
            className=" text-slate-400 font-bold"
          >
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{loading ? '...' : tweetCount ?? '...'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RichHashtag;

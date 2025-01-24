import { useMutation } from '@apollo/client';
import { Button, ButtonProps } from '@/components/app/Button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Repeat2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import AuthRequiredDialog from '@/components/app/AuthRequiredDialog';
import RetweetDialogContent from './RetweetDialogContent';
import { useUser } from '@/context/UserProvider';
import {
  Tweet,
  Tweet as TweetType,
  MutationRetweetTweetArgs,
  MutationUnretweetTweetArgs,
} from '@/gql/graphql';
import {
  retweetTweet as retweetTweetMutation,
  unretweetTweet as unretweetTweetMutation,
} from '@/gql/mutations/common/Retweet.js';
import { TweetMetaInfo } from '@/lib/types';
import { isRateLimited } from '@/utils/rateLimitMap';

interface RetweetButtonProps extends ButtonProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const RetweetButton = ({
  data: tweetData,
  disabled = false,
  meta,
}: RetweetButtonProps) => {
  // Vars
  const { id: tweetId, retweetCount, _retweeted } = tweetData ?? {};

  // GraphQl
  const [retweetTweet, { loading: retweetMutationLoading }] =
    useMutation(retweetTweetMutation);
  const [unretweetTweet, { loading: unretweetMutationLoading }] = useMutation(
    unretweetTweetMutation,
  );

  // Hooks
  const { user } = useUser();

  const [isRetweeted, setIsRetweeted] = useState<boolean>(_retweeted);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const loading = useMemo(
    () => retweetMutationLoading || unretweetMutationLoading,
    [retweetMutationLoading, unretweetMutationLoading],
  );

  useEffect(() => setIsRetweeted(_retweeted), [_retweeted]);

  const retweetHandler = useCallback(async () => {
    if (!user?.id) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (loading) return;

    // Rate limit
    const rateLimitKey = `retweet_${user.id}`;
    if (isRateLimited(rateLimitKey)) {
      toast.error('You are being rate limited. Please try again in a moment.');
      return;
    }

    try {
      const retweetVariables: MutationRetweetTweetArgs = {
        tweetId,
        userId: user.id,
      };
      const unretweetVariables: MutationUnretweetTweetArgs = {
        tweetId,
        userId: user.id,
      };

      // Modify tweets in cache directly
      if (!isRetweeted) {
        await retweetTweet({
          variables: retweetVariables,
          update(cache, { data }) {
            const modifiedTweet: Tweet = data.retweetTweet as Tweet;
            console.log('[retweetPost]: update function:', modifiedTweet);
            cache.modify({
              id: cache.identify(modifiedTweet),
              fields: {
                retweetCount: () => retweetCount + 1,
                _retweeted: () => true,
              },
            });
          },
        });
      }
      if (isRetweeted) {
        await unretweetTweet({
          variables: unretweetVariables,
          update(cache, { data }) {
            const modifiedTweet: Tweet = data.unretweetTweet as Tweet;
            console.log('[unretweetPost]: update function:', modifiedTweet);
            cache.modify({
              id: cache.identify(modifiedTweet),
              fields: {
                retweetCount: () => retweetCount - 1,
                _retweeted: () => false,
              },
            });
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [
    isRetweeted,
    loading,
    retweetCount,
    retweetTweet,
    tweetId,
    unretweetTweet,
    user,
  ]);

  // If not logged in, dont show the retweet menu
  if (!user?.id) {
    return (
      <>
        <Button
          disabled={disabled}
          onClick={() => setIsAuthDialogOpen(true)}
          size="sm"
          variant="ghost"
          className="gap-1"
        >
          <div className="text-green-200 flex justify-center content-center">
            <Repeat2 className="h-3.5 w-3.5 my-auto mr-1" />
            <span>{retweetCount}</span>
          </div>
        </Button>
        <AuthRequiredDialog
          open={isAuthDialogOpen}
          onClose={() => setIsAuthDialogOpen(false)}
        />
      </>
    );
  }

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={disabled} asChild>
          <Button
            disabled={disabled}
            tooltip="Retweet or Quote"
            size="sm"
            variant="ghost"
            className="gap-1"
          >
            <div
              className={`${isRetweeted ? 'text-green-500' : 'text-green-200'} flex justify-center content-center`}
            >
              <Repeat2 className="h-3.5 w-3.5 my-auto mr-1" />
              <span>{retweetCount}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={retweetHandler}>
            {isRetweeted ? 'Unretweet' : 'Retweet'}
          </DropdownMenuItem>
          <DialogTrigger disabled={disabled} asChild>
            <DropdownMenuItem>Quote</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <RetweetDialogContent data={tweetData} meta={meta} />
    </Dialog>
  );
};

export default RetweetButton;

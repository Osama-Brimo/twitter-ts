import { Button, ButtonProps } from '@/components/app/Button';
import type {
  MutationLikePostArgs,
  MutationUnlikePostArgs,
  Post,
  Tweet,
  Tweet as TweetType,
} from '@/gql/graphql';
import { HeartIcon } from 'lucide-react';
import { useMutation } from '@apollo/client';
import {
  likePost as likePostMutation,
  unlikePost as unlikePostMutation,
} from '@/gql/mutations/common/Like.js';
import { useCallback, useMemo, useState } from 'react';
import { useUser } from '@/context/UserProvider';
import { toast } from 'sonner';
import AuthRequiredDialog from '@/components/app/AuthRequiredDialog';
import { isRateLimited } from '@/utils/rateLimitMap';
import { TweetMetaInfo } from '@/lib/types';
interface LikeButtonProps extends ButtonProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

// TODO: ! liking is broken rn lol
const LikeButton = ({
  data: tweetData,
  meta,
  disabled = false,
}: LikeButtonProps) => {
  // Vars
  const { id: tweetId, _liked, likeCount } = tweetData ?? {};
  const { postId, retweeterId } = meta ?? {};

  // GraphQl
  const [likePost, { loading: likeMutationLoading }] = useMutation(
    likePostMutation,
    {
      onError: (error) => {
        console.error('Like error:', error);
        toast('Could not like tweet, try again later.');
      },
    },
  );
  const [unlikePost, { loading: unlikeMutationLoading }] = useMutation(
    unlikePostMutation,
    {
      onError: (error) => {
        console.error('Like error:', error);
        toast('Could not unlike tweet, try again later.');
      },
    },
  );

  // Hooks
  const { user } = useUser();

  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const loading = useMemo(
    () => likeMutationLoading || unlikeMutationLoading,
    [likeMutationLoading, unlikeMutationLoading],
  );

  // Handlers
  const likeHandler = useCallback(async () => {
    if (!user?.id) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (loading) return;

    // Rate limit
    const rateLimitKey = `like_${user.id}`;
    if (isRateLimited(rateLimitKey)) {
      toast.error('You are being rate limited. Please try again in a moment.');
      return;
    }

    try {
      const likeVariables: MutationLikePostArgs = {
        postId,
        userId: user.id,
        retweeterId,
      };
      // Liking requires the post id because it notifies tweet author in case of retweets, but unliking only cares about tweet
      const unlikeVariables: MutationUnlikePostArgs = {
        tweetId,
        userId: user.id,
      };

      // Modify tweets in cache directly
      if (!_liked) {
        await likePost({
          variables: likeVariables,
          update(cache, { data }) {
            const modifiedPost: Post = data.likePost as Post;
            const modifiedTweet: Tweet = modifiedPost.tweet as Tweet;
            console.log(
              '[likePost]: update function - the modifed post:',
              modifiedPost,
            );
            cache.modify({
              id: cache.identify(modifiedPost),
              fields: {
                tweet(prev) {
                  return {
                    ...prev,
                    likeCount: likeCount + 1,
                    _liked: true,
                  };
                },
              },
            });
          },
        });
      }
      if (_liked) {
        await unlikePost({
          variables: unlikeVariables,
          update(cache, { data }) {
            const modifiedPost: Post = data.unlikePost as Post;
            const modifiedTweet: Tweet = modifiedPost.tweet as Tweet;
            console.log(
              '[unlikePost]: update function - the modifed post:',
              modifiedPost,
            );
            cache.modify({
              id: cache.identify(modifiedTweet),
              fields: {
                likeCount: () => likeCount - 1,
                _liked: () => false,
              },
            });
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [
    _liked,
    likeCount,
    likePost,
    loading,
    postId,
    retweeterId,
    tweetId,
    unlikePost,
    user,
  ]);

  return (
    <>
      <Button
        disabled={disabled}
        tooltip="Like"
        onClick={likeHandler}
        size="sm"
        variant="ghost"
        className="gap-1"
      >
        <div
          className={`${_liked ? 'text-red-500' : 'text-red-200'} flex justify-center content-center`}
        >
          <HeartIcon className="h-3.5 w-3.5 my-auto mr-1" />
          <span>{likeCount}</span>
        </div>
      </Button>
      <AuthRequiredDialog
        open={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </>
  );
};

export default LikeButton;

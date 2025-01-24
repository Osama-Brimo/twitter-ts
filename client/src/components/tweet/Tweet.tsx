import { useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import LikeButton from '@/components/tweet/buttons/like/LikeButton';
import ReplyButton from '@/components/tweet/buttons/reply/ReplyButton';
import RetweetButton from '@/components/tweet/buttons/retweet/RetweetButton';
import TweetDropdownMenu from '@/components/tweet/TweetDropdownMenu';
import UserAvatar from '@/components/app/UserAvatar';
import { Repeat2 } from 'lucide-react';
import { TweetDisplay, TweetPreviewContext } from '@/lib/types';
import RichText from '@/components/app/RichText';
import TweetMedia from '@/components/tweet/media/TweetMedia';
import SkeletonContent from '@/components/app/SkeletonContent';
import { readableDate } from '@/lib/helpers';
import TweetDialog from '@/components/tweet/thread/TweetDialog';

const Tweet = ({ tweet, meta, ...props }: TweetDisplay) => {
  // Vars
  const { author, quoting, media, meta: tweetDBMeta } = tweet ?? {};
  const { retweeterName, previewContext } = meta ?? {};

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Hooks
  const shouldShowMediaInsideTweetBody = useMemo(
    () => media?.length && previewContext !== TweetPreviewContext.threadParent,
    [media, previewContext],
  );

  const shouldDisableAnyMoreDialogs = useMemo(
    () =>
      previewContext === TweetPreviewContext.quoteDialog ||
      previewContext === TweetPreviewContext.replyDialog,
    [previewContext],
  );

  const handleActivateDialog = useCallback(() => {
    const quoting = previewContext === TweetPreviewContext.quoted;
    const thread = previewContext === TweetPreviewContext.threadParent;
    if (!quoting && !thread && !shouldDisableAnyMoreDialogs)
      setIsDialogOpen(true);
  }, [previewContext, setIsDialogOpen, shouldDisableAnyMoreDialogs]);

  if (!tweet?.id) return <SkeletonContent type="card" />;

  return (
    <>
      <Card className="cursor-pointer" {...props}>
        <CardHeader
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex-col">
            {previewContext === 'retweet' && (
              <div className="text-muted-foreground pb-5 flex">
                <div className="mr-2 my-auto">
                  <Repeat2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <small>
                    <strong>{`${retweeterName}`}</strong> retweeted
                  </small>
                </div>
              </div>
            )}
            <div>
              <UserAvatar
                user={author}
                withIdentifiers
                date={readableDate(tweet.createdAt)}
              />
            </div>
          </div>
          {previewContext !== TweetPreviewContext.quoted &&
          !shouldDisableAnyMoreDialogs ? (
            <TweetDropdownMenu data={tweet} meta={meta} />
          ) : null}
        </CardHeader>
        <CardContent>
          <div className='pl-14'>
            <div onClick={handleActivateDialog}>
              <RichText content={tweet?.content} />
            </div>
            {shouldShowMediaInsideTweetBody && media?.length ? (
              <TweetMedia
                media={media}
                dialogHandler={handleActivateDialog}
                galleryType={tweetDBMeta?.galleryType}
              />
            ) : null}
            {/* TODO: check if recursive quoting is working right */}
            {quoting?.id && (
              <div className="my-4">
                <Tweet
                  tweet={quoting}
                  meta={{
                    previewContext: TweetPreviewContext.quoted,
                    retweeterName: author?.id,
                    postId: quoting.postId,
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
        {previewContext !== TweetPreviewContext.quoted && (
          <CardFooter className="border-t p-4">
            <div>
              <ReplyButton
                data={tweet}
                meta={meta}
                disabled={shouldDisableAnyMoreDialogs}
              />
              <LikeButton
                data={tweet}
                meta={meta}
                disabled={shouldDisableAnyMoreDialogs}
              />
              <RetweetButton
                data={tweet}
                meta={meta}
                disabled={shouldDisableAnyMoreDialogs}
              />
            </div>
          </CardFooter>
        )}
      </Card>
      <TweetDialog
        tweet={tweet}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        meta={meta}
      />
    </>
  );
};

export default Tweet;

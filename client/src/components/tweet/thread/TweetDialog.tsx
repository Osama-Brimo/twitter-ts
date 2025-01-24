import { useCallback, useEffect, useState } from 'react';
import {
  type Tweet as TweetType,
  type Post as PostType,
  QueryGetPostWithRepliesArgs,
  Media,
} from '@/gql/graphql';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { TweetMetaInfo, TweetPreviewContext } from '@/lib/types';
import Tweet from '../Tweet';
import TweetDialogMedia from './TweetDialogMedia';
import { ScrollArea } from '@/components/ui/scroll-area';
import Thread from './Thread';

import { useLazyQuery } from '@apollo/client';
import { getPostWithRepliesQuery } from '@/gql/queries/common/Post';
import SkeletonContent from '@/components/app/SkeletonContent';
import { client } from '@/lib/apollo';
import { toast } from 'sonner';

interface TweetDialogProps {
  tweet: TweetType;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  meta: TweetMetaInfo;
}

const TweetDialog = ({
  tweet,
  isDialogOpen,
  setIsDialogOpen,
  meta,
}: TweetDialogProps) => {
  const { quoting, media } = tweet ?? {};
  const { post, postId } = meta ?? {};
  const { cache } = client;

  const [nextNode, setNextNode] = useState<TweetType>();
  const [getPostWithReplies, { loading }] = useLazyQuery(
    getPostWithRepliesQuery,
  );
  /**
   * Fetches and caches the next node in a tweet thread hierarchy.
   *
   * This function handles two cases:
   * 1. When a tweet has children and a parent (middle of thread):
   *    - Fetches the full tweet data with replies using getPostWithReplies query
   *    - Sets the fetched tweet as the next node to render
   *
   * 2. When a tweet has no children or no parent (end of thread):
   *    - Writes the existing tweet data to cache without fetching
   *    - This unifies caching behavior for both cases
   *
   * The function follows these rules for thread data:
   * - Any query fetching tweet 'n' provides its children [...nN] and grandchildren [...nN+1]
   * - Root tweets (no parent) already have initial children [...n0] and their children [...n1]
   * - Only fetch if the tweet has both children and a parent
   *
   * @throws {Error} If there's an error fetching the thread data
   * @returns {Promise<void>}
   */
  const fetchNextNode = useCallback(async () => {
    // On any given tweet, we always need the replies (fully populated children), and the children's children (as just ids).
    // This setup allows a thread to exist anywhere where a query returns a post, and saves a fetch on the first click (which would happen very often).
    //
    // If a given tweet is `n` and its children are called `...nN`:
    //  A. We know that any query we define to fetch a tweet `n` should always provide `[...nN, ...nN+1]`.
    //  B. If `n` has no parent, we should have `[...n0, ...n1]` (so no need to fetch, some feed query already provided intial set).
    //  C. If `...nN` is not empty, fetch.

    try {
      console.log(`[fetchNextNode]: handler fired on tweet:`, tweet);

      // First, try reading from cache
      // const { getPostWithReplies: postInCache } =
      //   client.readQuery({
      //     query: getPostWithRepliesQuery,
      //     variables: { id: postId },
      //   }) ?? {};

      // if (postInCache?.id) {
      //   console.log(
      //     `[fetchNextNode]: Read from cache. Setting nextNode as:`,
      //     postInCache,
      //   );
      //   setNextNode(postInCache.tweet);
      //   return;
      // }

      // Fetch only if there's children and nN > 0
      if (tweet.children?.length && tweet.parentId) {
        // We now have `...nN`, but not `...nN+1` (we can display tweet + its replies, but can't check if the replies have replies).
        // Fetch the clicked tweet and set `nextNode`, which is then fed back into this component recursively.
        console.log(`[fetchNextNode]: No cache, should query for nextNode.`);

        const variables: QueryGetPostWithRepliesArgs = { id: tweet.postId };

        await getPostWithReplies({
          variables,

          onCompleted({ getPostWithReplies: getPostWithRepliesResult }) {
            const nextPost: PostType = getPostWithRepliesResult;
            if (nextPost?.id && nextPost?.tweet?.id) {
              // TODO: care should be taken here, because the value written to cache, will have a parent, which will be the same ref as the actual parent in cache and will overwrite it
              // in other words, whatever parent nextNode contains, it will overwrite it's actual parent ref in cache.
              // We can simply return the correct shape of data, but Ideally, we should stop this from happening, or find a better approach altogether.
              setNextNode(nextPost.tweet);
              console.log(
                `[fetchNextNode] Completed query, and setNextNode to:`,
                nextPost,
              );
            }
          },
          onError(error) {
            console.error(
              `[fetchNextNode]: Encountered error while trying to get next post in reply chain`,
              error,
            );
          },
        });
      }

      // Post not in cache, and is a topmost parent. Write to cache and return input as nextNode.
      else {
        // Unify the thread caching logic regardless of whether a query was ran or not to fetch the replies.
        // Otherwise there would be a case where: feed > open thread > (data from children w/ no query) > reply to tweet replies w/ tweetBox > no query to update.
        console.log(
          `[fetchNextNode]: Already had initial data; caching as query instead.`,
          tweet,
        );

        if (!post?.id) {
          console.error(
            `[fetchNextNode]: No post provided for tweet. Post is required to write to cache.`,
          );
          return;
        }

        console.log(`[fetchNextNode]: Writing post to cache.`, post);

        const { __ref } =
          cache.writeQuery({
            query: getPostWithRepliesQuery,
            variables: { id: cache.identify(post) },
            data: {
              getPostWithReplies: {
                ...post,
              },
            },
          }) ?? {};

        // Write to cache succeeded
        if (__ref) {
          setNextNode(tweet);
          return;
        }
      }
    } catch (error) {
      toast.error('A problem occured while fetching thread. Try again later.');
      throw new Error(error);
    }
  }, [cache, getPostWithReplies, post, tweet]);

  const handleActivateDialog = useCallback(() => {
    if (!quoting) setIsDialogOpen(true);
  }, [quoting, setIsDialogOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
    },
    [setIsDialogOpen],
  );

  useEffect(() => {
    (async () => {
      if (isDialogOpen && !nextNode) await fetchNextNode();
    })();
  }, [fetchNextNode, isDialogOpen, nextNode]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex flex-row p-0"
        style={{
          width: media?.length ? '80vw' : '50vw',
          height: '90vh',
          maxWidth: 'none',
        }}
      >
        {/* Media */}
        {media?.length ? (
          <div className="h-full max-h-full w-1/2">
            <TweetDialogMedia
              media={media as Media[]}
              dialogHandler={handleActivateDialog}
            />
          </div>
        ) : null}

        {/* Replies */}
        <div className={`h-full p-3 ${media?.length ? 'w-1/2' : 'w-full'}`}>
          <ScrollArea
            className="pr-2"
            style={{
              height: '100%',
            }}
          >
            <Tweet
              tweet={tweet}
              meta={{
                ...meta,
                previewContext: TweetPreviewContext.threadParent,
              }}
            />
            {!loading && nextNode?.id ? (
              <Thread tweet={nextNode} />
            ) : (
              <SkeletonContent type="card" repeat={4} />
            )}
          </ScrollArea>
        </div>
        <DialogTitle hidden>{tweet?.author?.name}</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default TweetDialog;

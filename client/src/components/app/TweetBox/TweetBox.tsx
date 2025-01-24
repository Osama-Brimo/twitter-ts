import { CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/app/Button';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { DocumentNode, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useUser } from '@/context/UserProvider';
import { createTweet as createTweetMutation } from '@/gql/mutations/common/Tweet';
import { returnTweetBoxLabels } from '@/lib/helpers';
import { tweetSchema } from '@/lib/zod';
import { Form, FormMessage } from '@/components/ui/form';
import AuthRequiredDialog from '../AuthRequiredDialog';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MutationCreateTweetArgs,
  Post,
  Tweet,
  type Tweet as TweetType,
} from '@/gql/graphql';
import { Input } from '@/components/ui/input';
import RichTextArea from '../RichTextArea';
import { ALLOWED_EXTENSIONS } from '@/lib/constants';
import { useMediaUpload } from '@/lib/hooks';
import { client } from '@/lib/apollo';
import { getPostWithRepliesQuery } from '@/gql/queries/common/Post';

type TweetFormValues = z.infer<typeof tweetSchema>;
// type TweetFormField = keyof TweetFormValues;

interface TweetBoxProps {
  context: 'post' | 'reply' | 'thread' | 'quote';
  quoteOf?: TweetType;
  replyOf?: TweetType;
  query?: DocumentNode;
  queryName?: string;
}

const TweetBox = ({
  context,
  quoteOf,
  replyOf,
  query,
  queryName,
}: TweetBoxProps) => {
  // Vars
  const { placeholder, buttonLabel } = returnTweetBoxLabels(context);

  // Hooks
  const navigate = useNavigate();
  const { user } = useUser();
  const form = useForm<TweetFormValues>({
    resolver: zodResolver(tweetSchema),
    defaultValues: {
      content: '',
      // FileList should only be received from APIs, and can't be instantiated
      media: null,
    },
    mode: 'onChange',
  });
  // const { cache } = client ?? {};
  const { uploadAndCreateMedia } = useMediaUpload();
  // State
  const [tweetPending, setTweetPending] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  // GraphQL
  // TODO: !cache
  const [createTweet, { loading: mutationLoading }] =
    useMutation(createTweetMutation);

  const loading = useMemo(
    () => tweetPending || mutationLoading,
    [mutationLoading, tweetPending],
  );

  // Helpers
  /**
   * Discards tweet draft and resets form.
   */
  const discardForm = useCallback(() => {
    form.reset({ content: '', media: null });
    // fileRef.current.value = null;
    localStorage.removeItem('draftTweet');
  }, [form]);

  /**
   * Asynchronously creates a tweet and associates it with given `Media`, performing all necessary tasks after.
   *
   * @param {MutationCreateTweetArgs} args - The arguments required to create a tweet.
   * @param {string} args.authorId - The ID of the author creating the tweet.
   * @param {string} args.content - The content of the tweet.
   * @param {TweetType} [args.quoteOf] - The tweet being quoted, if any.
   * @param {TweetType} [args.replyOf] - The tweet being replied to, if any.
   * @param {string[]} [args.media] - The media associated with the tweet.
   * @returns {Promise<void>} A promise that resolves when the tweet creation process is complete.
   */
  const createTweetHelper = useCallback(
    async ({
      authorId,
      content,
      quoteOf,
      replyOf,
      media,
    }: MutationCreateTweetArgs) => {
      const variables: MutationCreateTweetArgs = {
        content,
        authorId,
        quoteOf: quoteOf?.id ?? undefined,
        replyOf: replyOf?.id ?? undefined,
        media,
      };
      await createTweet({
        variables,
        onCompleted: ({ createTweet: createTweetCompletedResult }) => {
          const newPost = createTweetCompletedResult as Post;
          const newTweet = newPost?.tweet as Tweet;

          if (newTweet?.id) {
            const successMessage = replyOf?.id
              ? `Reply posted!`
              : 'Tweet posted!';
            toast.success(successMessage, {
              action: {
                label: 'View Tweet',
                // TODO: Simplest path for tweets would be just this, there's no point in adding the user
                onClick: () => navigate(`/tweet/${newTweet?.id}`),
              },
            });
            discardForm();
          }
        },
        onError: (err) => {
          toast.error('Failed to post Tweet.');
          console.error(err);
        },
        update: (cache, { data }) => {
          const newPost = data.createTweet as Post;
          const newTweet = newPost.tweet as Tweet;

          // If this is a reply, it shouldn't appear in the active feed query.
          if (replyOf?.id && newPost.tweet?.parent?.id) {
            // With replies, we have two cases:
            // 1. reply to a tweet from feed by just clicking reply button: No cached query exists, so we must modify the tweet directly.
            // 2. reply to a tweet from inside a thread: A cached query exists (see TweetDialog.tsx), so modify that.

            console.log(`[TweetBox]: Reply - Updating...`);

            // Check if there's a query in cache
            const { getPostWithReplies: postInCache } = client.readQuery({
              query: getPostWithRepliesQuery,
              variables: { id: replyOf.id },
            });

            console.log(`[TweetBox]: Reply - postInCache`, postInCache);

            // case 1 - modify tweet children to include new tweet
            if (!postInCache?.id) {
              console.log(
                `[TweetBox]: Reply - no postInCache found, updating tweet cache directly.`,
              );
              cache.modify({
                id: cache.identify(replyOf),
                fields: {
                  children: () => [...replyOf.children, newTweet],
                },
              });
            }
            // case 2 - modify query to include new tweet
            else {
              console.log(`[TweetBox]: Reply - postInCache found, updating...`);
              cache.updateQuery(
                { query: getPostWithRepliesQuery },
                (existing) => {
                  console.log('[updateQuery] Reply: newPost', newPost);
                  console.log('[updateQuery]: Reply: existing', existing);
                  return {
                    getPostWithReplies: [
                      ...existing.getPostWithReplies,
                      newPost,
                    ],
                  };
                },
              );
            }
          }
          // Otherwise, just update feed normally.
          else {
            cache.updateQuery({ query }, (existing) => {
              console.log('[updateQuery]: newPost', newPost);
              console.log('[updateQuery]: existing', existing);
              return {
                [queryName]: [newPost, ...existing[queryName]],
              };
            });
          }
        },
      });
    },
    [createTweet, discardForm, navigate, query, queryName],
  );

  /**
   * Asynchronously creates a tweet and associates it with given `FileList`, uploading files and creating `Media` instances.
   *
   * @param {FileList} files - The list of files to be uploaded and associated with the tweet.
   * @param {Object} tweetArgs - The arguments required to create the tweet.
   * @param {string} tweetArgs.authorId - The ID of the author creating the tweet.
   * @param {string} tweetArgs.content - The content of the tweet.
   * @param {TweetType} [tweetArgs.quoteOf] - The tweet being quoted, if any.
   * @param {TweetType} [tweetArgs.replyOf] - The tweet being replied to, if any.
   * @returns {Promise<void>} A promise that resolves when the tweet and media creation process is complete.
   */
  const createTweetWithFiles = useCallback(
    async (
      files: FileList,
      {
        authorId,
        content,
        quoteOf,
        replyOf,
      }: Exclude<MutationCreateTweetArgs, 'media'>,
    ) => {
      if (!user?.id) {
        setIsAuthDialogOpen(true);
        return;
      }

      const newTweetMedia = await uploadAndCreateMedia({ files, user });

      console.log(
        `[createTweetWithFiles]: proceeding with newTweetMedia:`,
        newTweetMedia,
      );
      if (newTweetMedia?.length) {
        const newMediaIds = newTweetMedia.map((media) => media.id);
        await createTweetHelper({
          authorId,
          content,
          media: newMediaIds,
          quoteOf,
          replyOf,
        });
      }
    },
    [createTweetHelper, uploadAndCreateMedia, user],
  );

  // Effects
  useEffect(() => {
    const savedDraft = localStorage.getItem('draftTweet');
    if (savedDraft) {
      form.setValue('content', savedDraft);
    }
  }, [form]);

  // Save draft tweet to localStorage before user leaves the page
  useEffect(() => {
    const saveDraft = () => {
      const currentContent = form.getValues('content');
      if (currentContent) {
        localStorage.setItem('draftTweet', currentContent);
      }
    };
    window.addEventListener('beforeunload', saveDraft);
    return () => {
      window.removeEventListener('beforeunload', saveDraft);
    };
  }, [form]);

  const tweetSubmitHandler = async ({
    media: files,
    content,
  }: TweetFormValues) => {
    console.log('entered submit handler');
    if (!user?.id) {
      setIsAuthDialogOpen(true);
      return;
    }

    setTweetPending(true);

    const tweetArgs: MutationCreateTweetArgs = {
      authorId: user?.id,
      content,
      quoteOf,
      replyOf,
    };

    if (files?.length) {
      await createTweetWithFiles(files, tweetArgs);
    } else {
      await createTweetHelper(tweetArgs);
    }

    setTweetPending(false);
    return;
  };

  useEffect(() => {
    console.log(`[loading]: `, loading);
    console.log(`[mutationLoading]: `, mutationLoading);
    console.log(`[tweetPending]: `, tweetPending);
  }, [loading, mutationLoading, tweetPending]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(tweetSubmitHandler)}
          className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextArea
                    placeholder={placeholder}
                    value={field?.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    maxChars={280}
                  />
                </FormControl>
                <FormMessage className="px-3 font-semibold" />
              </FormItem>
            )}
          />
          <div className="flex items-center p-3 pt-2">
            <FormField
              control={form.control}
              name="media"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      multiple
                      // ref={fileRef}
                      accept={ALLOWED_EXTENSIONS}
                      type="file"
                      onChange={(e) => {
                        console.log(e.target.files);
                        // fileRef.current.value = e.target.files;
                        return field.onChange(e.target.files ?? undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              loading={loading}
              loadingLabel="Posting..."
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              {buttonLabel}
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </Form>
      <AuthRequiredDialog
        message="You need an account to post tweets. Sign up now to publish your tweet."
        open={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </>
  );
};

export default TweetBox;

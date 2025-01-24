import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Tweet from '../../Tweet';
import type { Tweet as TweetType } from '../../../../gql/graphql';
import { useUser } from '../../../../context/UserProvider';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { deletePost as deletePostMutation } from '@/gql/mutations/components/tweet/buttons/DeleteDialogContent';
import { TweetMetaInfo, TweetPreviewContext } from '@/lib/types';

interface DeleteDialogContentProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const DeleteDialogContent = ({ data, meta }: DeleteDialogContentProps) => {
  const { user } = useUser();
  const { postId, authorId } = data ?? {};
  const { query, queryName } = meta ?? {};

  const [deletePost] = useMutation(deletePostMutation, {
    variables: {
      authorId,
      postId,
    },
    onCompleted: () => {
      toast.success('Tweet deleted');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to delete tweet. Try again later.');
    },
    update(cache) {
      // TODO: this is fine mostly, but there might be a case where you want to only remove the post from thr query rather than evicting from cache totally.

      // Evict this specific post from cache completely
      cache.evict({ id: cache.identify({ __typename: 'Post', id: postId }) });
      cache.evict({ id: cache.identify({ __typename: 'Tweet', id: data.id }) });

      // Garbage collect any now-unreachable objects
      cache.gc();
    },
  });

  const handleDelete = async () => {
    if (user?.id === authorId) {
      await deletePost();
    } else {
      toast.error('Unauthorized action');
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this Tweet?</AlertDialogTitle>
        <AlertDialogDescription style={{ fontWeight: 'bold' }}>
          This Tweet will be gone forever. Are you sure?
        </AlertDialogDescription>
        <Tweet
          tweet={data}
          meta={{ previewContext: TweetPreviewContext.quoted, postId }}
        />
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default DeleteDialogContent;

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
import type { MutationDeletePostArgs, Tweet as TweetType } from '@/gql/graphql';
import { useUser } from '@/context/UserProvider';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { deletePost as deletePostMutation } from '@/gql/mutations/components/tweet/buttons/DeleteDialogContent';
import { TweetPreviewContext } from '@/lib/types';

interface DeleteDialogContentProps {
  data: TweetType;
  onClose: () => void;
}

const DeleteDialogContent = ({ data, onClose }: DeleteDialogContentProps) => {
  const { user } = useUser();
  const { authorId, postId } = data ?? {};

  const [deletePost] = useMutation(deletePostMutation);

  const handleDelete = async () => {
    try {
      if (user?.id !== authorId) {
        toast.error(`You can't delete this tweet.`);
        return;
      }
      const variables: MutationDeletePostArgs = {
        authorId,
        postId,
      };
      await deletePost({
        variables,
        onCompleted: () => {
          toast.success('Tweet deleted.');
          onClose();
        },
        update(cache) {
          // TODO: this is fine mostly, but there might be a case where you want to selectively remove the post from the query rather than evicting the ref from cache totally.

          // Evict this specific post from cache completely
          cache.evict({
            id: cache.identify({ __typename: 'Post', id: postId }),
          });

          // Garbage collect any now-unreachable objects
          cache.gc();
        },
      });
    } catch (error) {
      onClose();
      console.error(error);
      toast.error(`A problem occured while trying to delete tweet.`);
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

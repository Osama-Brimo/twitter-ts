import { useMemo } from 'react';
import type { Tweet as TweetType, User } from '@/gql/graphql';
import { Button } from '@/components/app/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BanIcon,
  EditIcon,
  FrownIcon,
  Link2Icon,
  MoreHorizontal,
} from 'lucide-react';
import DeleteButton from '@/components/tweet/buttons/delete/DeleteButton';
import { useUser } from '@/context/UserProvider';
import { toast } from 'sonner';
import { TweetMetaInfo } from '@/lib/types';
import { AlertDialog, AlertDialogTrigger } from '../ui/alert-dialog';
import BlockDialogContent from './buttons/block/BlockDialogContent';
import UnblockDialogContent from './buttons/block/UnblockDialogContent';

interface TweetDropdownMenuProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const TweetDropdownMenu = ({ data, meta }: TweetDropdownMenuProps) => {
  const { user: currentUser } = useUser();
  const { author, id, authorId } = data ?? {};
  const { _blocked } = author ?? {};

  const isAuthor = useMemo(
    () => authorId === currentUser?.id,
    [authorId, currentUser],
  );

  const handleCopyLink = async () => {
    const domain = location.origin;
    const handle = author?.handle;
    if (domain && handle && id) {
      await navigator.clipboard.writeText(`${domain}/${author?.handle}/${id}`);
      toast.success('Link copied!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <MoreHorizontal className="h-3.5 w-3.5" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAuthor ? (
            <>
              {/* TODO: Edit button */}
              <DropdownMenuItem>
                <EditIcon size="15" className="mr-1" />
                Edit
              </DropdownMenuItem>
              <DeleteButton data={data} meta={meta} />
            </>
          ) : (
            <>
              {currentUser?.id && (
                <>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>
                      <BanIcon size="15" className="mr-1" />
                      {!_blocked ? 'Block User' : 'Unblock User'}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <DropdownMenuItem>
                    <FrownIcon size="15" className="mr-1" />
                    See less often
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
            </>
          )}
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2Icon size="15" className="mr-1" />
            Copy link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {currentUser?.id && !_blocked ? (
        <BlockDialogContent targetUser={author as User} />
      ) : (
        <UnblockDialogContent targetUser={author as User} />
      )}
    </AlertDialog>
  );
};

export default TweetDropdownMenu;

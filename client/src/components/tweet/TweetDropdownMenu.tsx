import { useCallback, useMemo, useState } from 'react';
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
  TrashIcon,
} from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import { toast } from 'sonner';
import { TweetMetaInfo } from '@/lib/types';
import { AlertDialog, AlertDialogTrigger } from '../ui/alert-dialog';
import BlockDialogContent from './buttons/block/BlockDialogContent';
import UnblockDialogContent from './buttons/block/UnblockDialogContent';
import DeleteDialogContent from './buttons/delete/DeleteDialogContent';

interface TweetDropdownMenuProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

enum TweetDropdownDialogs {
  delete = 'delete',
  block = 'block',
  unblock = 'unblock',
}

const TweetDropdownMenu = ({ data }: TweetDropdownMenuProps) => {
  const { user: currentUser } = useUser();
  const { author, id, authorId } = data ?? {};
  const { _blocked, handle } = author ?? {};
  const [activeDialog, setActiveDialog] = useState<
    TweetDropdownDialogs | undefined
  >();

  const handleDialogClose = useCallback(() => {
    setActiveDialog(undefined);
  }, []);

  const TriggeredDialog = useMemo(() => {
    switch (activeDialog) {
      case TweetDropdownDialogs.delete:
        return <DeleteDialogContent data={data} onClose={handleDialogClose} />;
      case TweetDropdownDialogs.block:
        return <BlockDialogContent targetUser={author as User} onClose={handleDialogClose} />;
      case TweetDropdownDialogs.unblock:
        return <UnblockDialogContent targetUser={author as User} onClose={handleDialogClose} />;
      default:
        return <></>;
    }
  }, [activeDialog, author, data, handleDialogClose]);

  const isTweetAuthor = useMemo(
    () => authorId === currentUser?.id,
    [authorId, currentUser],
  );

  const handleCopyLink = async () => {
    const domain = location.origin;
    if (domain && handle && id) {
      await navigator.clipboard.writeText(`${domain}/${handle}/${id}`);
      toast.success('Link copied!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const deleteTriggerHandler = useCallback(() => {
    if (isTweetAuthor) setActiveDialog(TweetDropdownDialogs.delete);
  }, [isTweetAuthor]);

  const blockTriggerHandler = useCallback(() => {
    if (currentUser?.id && !_blocked)
      setActiveDialog(TweetDropdownDialogs.block);
  }, [_blocked, currentUser]);

  const unblockTriggerHandler = useCallback(() => {
    if (currentUser?.id && _blocked)
      setActiveDialog(TweetDropdownDialogs.unblock);
  }, [_blocked, currentUser]);

  return (
    <AlertDialog>
      {/* modal needs to be set to false here, or dialog will continue blocking after closing */}
      <DropdownMenu modal={false} >
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <MoreHorizontal className="h-3.5 w-3.5" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isTweetAuthor ? (
            <>
              {/* TODO: Edit button */}
              <DropdownMenuItem>
                <EditIcon size="15" className="mr-1" />
                Edit
              </DropdownMenuItem>
              <AlertDialogTrigger onClick={deleteTriggerHandler} asChild>
                <DropdownMenuItem>
                  <TrashIcon size="15" className="mr-1" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </>
          ) : (
            <>
              {currentUser?.id && (
                <>
                  <AlertDialogTrigger
                    onClick={
                      _blocked ? unblockTriggerHandler : blockTriggerHandler
                    }
                    asChild
                  >
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
      {TriggeredDialog}
    </AlertDialog>
  );
};

export default TweetDropdownMenu;

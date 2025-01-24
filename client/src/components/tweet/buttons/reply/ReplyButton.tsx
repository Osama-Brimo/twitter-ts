import { useState } from 'react';
import { ReplyIcon } from 'lucide-react';

import { Button, ButtonProps } from '@/components/app/Button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tweet as TweetType } from '@/gql/graphql';
import ReplyDialogContent from './ReplyDialogContent';
import { useUser } from '@/context/UserProvider';
import AuthRequiredDialog from '@/components/app/AuthRequiredDialog';
import { TweetMetaInfo } from '@/lib/types';

interface ReplyButtonProps extends ButtonProps {
  data: TweetType;
  meta: TweetMetaInfo;
}

const ReplyButton = ({ data, meta, disabled = false }: ReplyButtonProps) => {
  const { replyCount } = data ?? {};
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user } = useUser();

  if (!user) {
    return (
      <>
        <Button
          disabled={disabled}
          onClick={() => setIsAuthDialogOpen(true)}
          size='sm'
          variant='ghost'
          className='gap-1'
        >
          <ReplyIcon className='h-3.5 w-3.5' />
          <span>{replyCount}</span>
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
      <DialogTrigger disabled={disabled} asChild>
        <Button disabled={disabled} tooltip='Reply' size='sm' variant='ghost' className='gap-1'>
          <ReplyIcon className='h-3.5 w-3.5' />
          <span>{replyCount}</span>
        </Button>
      </DialogTrigger>
      <ReplyDialogContent meta={meta} data={data} />
    </Dialog>
  );
};

export default ReplyButton;

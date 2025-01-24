import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/app/Button';
import { AlertDialog, AlertDialogTrigger } from '../../../ui/alert-dialog';
import type { Tweet as TweetType } from '../../../../gql/graphql';
import DeleteDialogContent from './DeleteDialogContent';
import { TweetMetaInfo } from '@/lib/types';


interface DeleteButtonProps {
    data: TweetType;
    meta: TweetMetaInfo;
}

const DeleteButton = ({ data, meta }: DeleteButtonProps) => {


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1" >
        <TrashIcon size="15" className="mr-1" />
            Delete
        </Button>
      </AlertDialogTrigger>
      <DeleteDialogContent data={data} meta={meta} />
    </AlertDialog>
  );
};

export default DeleteButton;

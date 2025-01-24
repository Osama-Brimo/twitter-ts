import { Button } from '@/components/app/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const AuthRequiredDialog = ({ open, onClose, message }: AuthRequiredDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            { message || 'You need to be signed in to perform this action.' }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => navigate('/login')}>Log in</Button>
          <Button onClick={() => navigate('/signup')} variant="outline">
            Sign up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredDialog;

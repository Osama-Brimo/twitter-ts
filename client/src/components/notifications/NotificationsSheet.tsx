import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import NotificationsList from '@/routes/user/notifications/NotificationsList';

interface NotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsSheet = ({ open, onOpenChange }: NotificationsSheetProps) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <div className="flex items-center space-x-2 py-4">
            <Switch
              id="unread-mode"
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
            />
            <Label htmlFor="unread-mode">Show unread only</Label>
          </div>
        </SheetHeader>
        <NotificationsList filterUnread={showUnreadOnly} />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSheet; 
import { useMemo } from 'react';
import type { User as UserType } from '@/gql/graphql';
import { Button } from '@/components/app/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditIcon, FrownIcon, Link2Icon, MoreHorizontal } from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import { toast } from 'sonner';

interface ProfileDropdownMenuProps {
  user: UserType;
}

const ProfileDropdownMenu = ({ user }: ProfileDropdownMenuProps) => {
  const { user: currentUser } = useUser();
  const { id, handle } = user ?? {};

  const isSelf = useMemo(() => id === currentUser?.id, [currentUser, id]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <MoreHorizontal className="h-3.5 w-3.5" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isSelf ? (
          <>
            {/* TODO: Edit button */}
            <DropdownMenuItem>
              <EditIcon size="15" className="mr-1" />
              Edit Profile
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {/* <BlockButton targetUser={user} /> */}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdownMenu;

import {
  Package2,
  Home,
  SearchIcon,
  BellIcon,
  Users2,
  SettingsIcon,
  Activity,
} from 'lucide-react';
import { SheetContent } from '@/components/ui/sheet';

const SidebarMobile = () => {
  return (
    <SheetContent side="left" className="sm:max-w-xs">
      <nav className="grid gap-6 text-lg font-medium">
        {/* TODO: replace these (and any remaining) with react router Links */}
        <a
          href="#"
          className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
        >
          <Activity className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">Twitter</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
        >
          <Home className="h-5 w-5" />
          Home
        </a>
        <a
          href="#"
          className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
        >
          <SearchIcon className="h-5 w-5" />
          Orders
        </a>
        <a href="#" className="flex items-center gap-4 px-2.5 text-foreground">
          <BellIcon className="h-5 w-5" />
          Notifications
        </a>
        <a
          href="#"
          className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
        >
          <Users2 className="h-5 w-5" />
          Profile
        </a>
        <a
          href="#"
          className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
        >
          <SettingsIcon className="h-5 w-5" />
          Settings
        </a>
      </nav>
    </SheetContent>
  );
};

export default SidebarMobile;

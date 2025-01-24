import {
  SearchIcon,
  BellIcon,
  Users2,
  Settings,
  HomeIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { useUser } from '../../../context/UserProvider';

import { Label } from '@/components/ui/label';
import {
  Sidebar as ShadCnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { User } from '@/gql/graphql';
import { useCallback, useEffect, useMemo, useState } from 'react';
import NotificationsList from '@/routes/user/notifications/NotificationsList';

const AppSidebar = () => {
  const { user } = useUser() ?? {};
  const { notifications } = (user as User) ?? {};
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [notifsSidebarActive, setNotifsSidebarActive] = useState(false);

  const unreadNotifs = useMemo(
    () =>
      notifications?.length
        ? notifications.filter((notif) => !notif?.seen)
        : [],
    [notifications],
  );

  const unreadNotifsCount = useMemo(
    () => (unreadNotifs.length > 99 ? '99+' : unreadNotifs.length),
    [unreadNotifs.length],
  );

  const handleUnreadSwitchChange = useCallback(
    (checked: boolean) => setShowOnlyUnread(checked),
    [],
  );

  const notifsToShow = useMemo(
    () => (showOnlyUnread ? unreadNotifs : notifications),
    [notifications, showOnlyUnread, unreadNotifs],
  );

  useEffect(() => {
    setNotifsSidebarActive(false);
  }, [user]);

  return (
    <>
      <aside className="fixed left-0 hidden w-14 border-r bg-background sm:flex z-50 flex-col justify-center content-between h-full">
        <div className='h-full flex flex-col justify-between'>
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link to={`/`}>
              <div className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                <svg
                  width={16}
                  height={16}
                  className='fill-white dark:fill-black'
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>X</title>
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>{' '}
                <span className="sr-only">Twitter</span>
              </div>
            </Link>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/`}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                      <HomeIcon className="h-5 w-5" />
                      <span className="sr-only">Home</span>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Home</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/`}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                      <SearchIcon className="h-5 w-5" />
                      <span className="sr-only">Explore</span>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Explore</TooltipContent>
              </Tooltip>
              {user?.id && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => {
                          setNotifsSidebarActive((prev) => !prev);
                        }}
                      >
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                          <BellIcon className="h-5 w-5" />
                          <span className="sr-only">Notifications</span>
                          {unreadNotifsCount ? (
                            <div className="absolute bg-blue-400 rounded-full h-5 w-5 bottom-5 left-5 text-center flex justify-center content-center">
                              <div className="text-white font-bold text-sm">
                                <small>{unreadNotifsCount}</small>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Notifications</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={user?.id ? `/${user?.handle}` : `/login`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                          <Users2 className="h-5 w-5" />
                          <span className="sr-only">Profile</span>
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Profile</TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/settings`}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Settings</span>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </nav>
        </div>
        {/* Notifications */}
        {/* {user?.id && (
          <ShadCnSidebar
            collapsible="icon"
            className={`hidden left-14 transition-all overflow-hidden ${notifsSidebarActive ? '--sidebar-width' : 'w-0 h-0 hidden'}`}
          >
            <SidebarHeader className="gap-3.5 border-b p-4">
              <div className="flex w-full items-center justify-between">
                <div className="text-base font-medium text-foreground">
                  <span>Notifications</span>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      You have {unreadNotifs.length} new notifications.
                    </span>
                  </div>
                </div>
                <Label className="flex items-center gap-2 text-sm">
                  <span>Unreads</span>
                  <Switch
                    defaultChecked={false}
                    onCheckedChange={handleUnreadSwitchChange}
                    className="shadow-none"
                  />
                </Label>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup className="px-0">
                <SidebarGroupContent>
                  <NotificationsList />
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </ShadCnSidebar>
        )} */}
      </aside>
    </>
  );
};

export default AppSidebar;

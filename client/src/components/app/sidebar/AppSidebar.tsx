import { BellIcon, Users2, Settings, HomeIcon, SearchIcon } from 'lucide-react';
import { Link, useMatch } from 'react-router-dom';
import { useUser } from '../../../context/UserProvider';
import { useState } from 'react';
import NotificationsSheet from '@/components/notifications/NotificationsSheet';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { User } from '@/gql/graphql';
import { useMemo } from 'react';
import { NavUser } from './NavUser';
import { NavMain } from './NavMain';

const AppSidebar = () => {
  const { user: currentUser } = useUser();
  const { notifications } = (currentUser as User) ?? {};
  const { isMobile } = useSidebar();

  const matchHome = useMatch('/');
  const matchExplore = useMatch('/explore');
  const matchNotifications = useMatch('/notifications');
  const matchProfile = useMatch(`/user/${currentUser?.handle}`);

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

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (isMobile) {
    return (
      <Sidebar 
        collapsible="offcanvas" 
        className="py-4"
      >
        <SidebarHeader>
          <Link to={`/`}>
            <div className="group flex items-center justify-center gap-2 rounded  text-lg font-semibold text-primary-foreground h-8 w-8 md:text-base">
              <svg
                width={16}
                height={16}
                className="fill-white dark:fill-black"
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>X</title>
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
              <span className="sr-only">twitter-ts</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={!!matchHome}
                    className="w-full justify-start gap-4"
                    asChild
                  >
                    <Link to="/">
                      <HomeIcon className="h-5 w-5" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={!!matchExplore}
                    className="w-full justify-start gap-4"
                    asChild
                  >
                    <Link to="/explore">
                      <SearchIcon className="h-5 w-5" />
                      <span>Explore</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {currentUser?.id && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={!!matchNotifications}
                        className="w-full justify-start gap-4"
                        onClick={() => setNotificationsOpen(true)}
                      >
                        <BellIcon className="h-5 w-5" />
                        <span>Notifications</span>
                        {unreadNotifsCount > 0 && (
                          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {unreadNotifsCount}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={!!matchProfile}
                        className="w-full justify-start gap-4"
                        asChild
                      >
                        <Link to={`/user/${currentUser?.handle}`}>
                          <Users2 className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {currentUser?.id && <NavUser user={currentUser as User} />}
        </SidebarFooter>
        <NotificationsSheet 
          open={notificationsOpen} 
          onOpenChange={setNotificationsOpen}
        />
      </Sidebar>
    );
  }

  else
    return (
      <Sidebar
        // collapsible="icon"
        // variant='floating'
        className="!w-[calc(var(--sidebar-width-icon)_+_10px)] h-full py-2 pb-12 z-50 flex flex-col justify-center items-center"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="flex justify-center"
              >
                <Link to={`/`}>
                  <div className="group flex items-center justify-center gap-2 rounded  text-lg font-semibold text-primary-foreground h-8 w-8 md:text-base">
                    <svg
                      width={16}
                      height={16}
                      className="fill-white "
                      role="img"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>X</title>
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                    <span className="sr-only">twitter-ts</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: 'Home',
                      hidden: false,
                    }}
                    isActive={!!matchHome}
                    className="px-2.5 md:px-2 flex justify-center"
                    asChild
                  >
                    <Link to="/">
                      <HomeIcon />
                      <span className="sr-only">Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: 'Explore',
                      hidden: false,
                    }}
                    isActive={!!matchExplore}
                    className="px-2.5 md:px-2 flex justify-center"
                    asChild
                  >
                    <Link to="/explore">
                      <SearchIcon />
                      <span className="sr-only">Explore</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {currentUser?.id && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={{
                          children: 'Notifications',
                          hidden: false,
                        }}
                        isActive={!!matchNotifications}
                        className="px-2.5 md:px-2 flex justify-center"
                        onClick={() => setNotificationsOpen(true)}
                      >
                        <BellIcon />
                        <span className="sr-only">Notifications</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={{
                          children: 'Profile',
                          hidden: false,
                        }}
                        isActive={!!matchProfile}
                        className="px-2.5 md:px-2 flex justify-center"
                        asChild
                      >
                        <Link to={`/user/${currentUser?.handle}`}>
                          <Users2 />
                          <span className="sr-only">Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="flex flex-col items-center">
          <SidebarMenu>
            { currentUser?.id && <NavUser user={currentUser as User} /> }
          </SidebarMenu>
        </SidebarFooter>
        <NotificationsSheet 
          open={notificationsOpen} 
          onOpenChange={setNotificationsOpen}
        />
      </Sidebar>
    );
};

export default AppSidebar;

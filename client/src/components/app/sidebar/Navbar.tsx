import { Link, useMatch, useNavigate } from 'react-router-dom';
import SearchForm from './SearchForm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, StarsIcon } from 'lucide-react';
import { useMemo } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import { useUser } from '@/context/UserProvider';

const Navbar = () => {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();

  const matchHome = useMatch('/');
  const matchTweet = useMatch('/tweet/:id');
  const matchUserPosts = useMatch('/user/:handle/posts');
  const matchUserLikes = useMatch('/user/:handle/likes');
  const matchUserFollowers = useMatch('/user/:handle/followers');
  const matchUserFollowing = useMatch('/user/:handle/following');

  const breadcrumbs = useMemo(() => {
    if (matchHome) return ['Latest Tweets'];
    if (matchTweet) return ['Tweet Replies'];
    if (matchUserPosts)
      return [`@${matchUserPosts.params.handle}`, 'All Posts'];
    if (matchUserLikes) return [`@${matchUserLikes.params.handle}`, 'Likes'];
    if (matchUserFollowers)
      return [`@${matchUserFollowers.params.handle}`, 'Followers'];
    if (matchUserFollowing)
      return [`@${matchUserFollowing.params.handle}`, 'Following'];
    return [];
  }, [
    matchHome,
    matchTweet,
    matchUserFollowers,
    matchUserFollowing,
    matchUserLikes,
    matchUserPosts,
  ]);

  return (
    <header className="px-6 sticky top-0 bg-background z-40 flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-20">
      <div className="flex justify-between w-full px-4 pr-9">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden -ml-1" />
          <Breadcrumb>
            <BreadcrumbList className="select-none">
              {!matchHome && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(-1);
                  }}
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span className="sr-only">Back</span>
                </Button>
              )}
              {breadcrumbs.map((breadcrumb, i: number) => {
                const hasMore = i < breadcrumbs.length - 1;
                return (
                  <React.Fragment key={i}>
                    {/* TODO: for now we only want an icon at home, but replace with objects with custom icons later */}
                    {breadcrumb === 'Latest Tweets' && <StarsIcon color='white' />}
                    <BreadcrumbItem className="text-base text-white/80 font-extralight">
                      {breadcrumb}
                    </BreadcrumbItem>
                    {hasMore && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <SearchForm />
          {!currentUser?.id && (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

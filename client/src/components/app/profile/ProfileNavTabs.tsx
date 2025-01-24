import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedQueryHandlers } from '../../../lib/types';

interface ProfileNavTabsProps {
  queryHandlers: FeedQueryHandlers;
  value: string;
  id?: string;
}

const ProfileNavTabs = ({ queryHandlers, value, id }: ProfileNavTabsProps) => {
  const {
    handleViewPosts,
    handleViewLikes,
    handleViewFollowers,
    handleViewFollowing,
  } = queryHandlers;

  return (
    <div className="flex h-14 items-center gap-4 border-b sm:h-auto sm:border-0 sm:bg-transparent">
      <Tabs value={value} id={id}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger onClick={handleViewPosts} value="posts">
              Posts
            </TabsTrigger>
            <TabsTrigger onClick={handleViewLikes} value="likes">
              Likes
            </TabsTrigger>
            <TabsTrigger onClick={handleViewFollowers} value="followers">
              Followers
            </TabsTrigger>
            <TabsTrigger onClick={handleViewFollowing} value="following">
              Following
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};
export default ProfileNavTabs;

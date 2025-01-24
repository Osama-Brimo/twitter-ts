import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedQueryHandlers } from '../../lib/types';

interface HomeFeedNavTabsProps {
  queryHandlers: FeedQueryHandlers;
  value: string;
}

const HomeFeedNavTabs = ({ queryHandlers, value }: HomeFeedNavTabsProps) => {
  const {
    handleFeedForYou,
    handleFeedFollowing,
    handleFeedDiscover,
  } = queryHandlers;

  return (
    <div className="flex h-14 items-center gap-4 border-b sm:h-auto sm:border-0 bg-transparent">
    <Tabs value={value}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger onClick={handleFeedForYou} value="foryou">For You</TabsTrigger>
          <TabsTrigger onClick={handleFeedFollowing} value="following">Following</TabsTrigger>
          <TabsTrigger onClick={handleFeedDiscover} value="discover">Discover</TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  </div>
  );
};
export default HomeFeedNavTabs;

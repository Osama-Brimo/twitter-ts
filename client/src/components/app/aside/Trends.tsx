import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import SkeletonContent from '../SkeletonContent';
import { Link } from 'react-router-dom';
import { Hashtag } from '@/gql/graphql';

interface TrendsProps {
  loading: boolean;
  trends: Hashtag[];
}

const Trends = ({ trends, loading }: TrendsProps) => {
  return (
    <Card x-chunk="dashboard-07-chunk-5">
      <CardHeader>
        <CardTitle>Trends</CardTitle>
        <CardDescription>Currently trending</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {loading ? (
            <SkeletonContent type="text" repeat={2} />
          ) : (
            trends.map((trend) => {
              const { id, hashtag, tweetCount } = trend;
              return (
                <div className="flex justify-between font-bold" key={id}>
                  <Link to="/">#{hashtag}</Link>
                  <div className='text-muted-foreground text-sm'>
                    <span>{tweetCount} Tweets</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Trends;

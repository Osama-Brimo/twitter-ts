import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import SkeletonContent from '../SkeletonContent';
import { Link } from 'react-router-dom';

const Trends = () => {
  const loading = true;
  return (
    <Card x-chunk="dashboard-07-chunk-5">
      <CardHeader>
        <CardTitle>Trends</CardTitle>
        <CardDescription>Currently trending</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-5'>
        {loading ? (
          <SkeletonContent type="text" repeat={2} />
        ) : (
          <Link to='/'>#SomeTopicHere</Link>
        )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Trends;

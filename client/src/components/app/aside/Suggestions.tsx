import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SkeletonContent from '../SkeletonContent';
import { User } from '@/gql/graphql';
import UserCard from '../UserCard';

interface SuggestionsProps {
  suggestions: User[];
  loading: boolean;
}

export default function Suggestions({
  suggestions,
  loading,
}: SuggestionsProps) {

  if (!loading && !suggestions.length) return;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to follow</CardTitle>
        <CardDescription>
          Suggested for you based on your activity
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-8">
        {loading ? (
          <>
            <SkeletonContent type="user" repeat={3} />
          </>
        ) : (
          <>
            {suggestions.map((user) => (
              <UserCard user={user} key={user.id} variant="compact" />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

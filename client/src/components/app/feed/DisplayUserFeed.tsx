import { User } from "../../../gql/graphql";
import SkeletonContent from "../SkeletonContent";
import UserCard from "../UserCard";

interface DisplayUserFeedProps {
    loading: boolean;
    items: User[];
}

const DisplayUserFeed = ({loading, items}: DisplayUserFeedProps) => {

    return (
        <div className="grid gap-2">
        {loading && !items?.length ? (
          <SkeletonContent type="user" repeat={3} />
        ) : (
          items?.map((item: User) => {
            return (
              <UserCard user={item}/>
            );
          })
        )}
      </div>
    );
};

export default DisplayUserFeed;
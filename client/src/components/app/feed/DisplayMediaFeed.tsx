import { Media } from "../../../gql/graphql";
import SkeletonContent from "../SkeletonContent";

interface DisplayMediaFeedProps {
    loading: boolean;
    items: Media[];
}

const DisplayMediaFeed = ({loading, items}: DisplayMediaFeedProps) => {

    return (
        <div className="grid gap-2">
        {loading && !items?.length ? (
          <SkeletonContent type="card" repeat={3} />
        ) : (
          items?.map((item: Media) => {
            return (
              // <Tweet
              //   key={displayData?.key}
              //   data={displayData?.tweet}
              //   meta={displayData?.meta}
              // />
              <></>
            );
          })
        )}
      </div>
    );
};

export default DisplayMediaFeed;
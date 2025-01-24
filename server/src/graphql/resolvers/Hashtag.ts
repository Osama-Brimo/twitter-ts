import { ApolloContext } from '../context';
import { HashtagResolvers } from '../generated/graphql';

const HashtagResolver: HashtagResolvers<ApolloContext> = {
  tweetCount(hashtag) {
    return hashtag.tweets?.length ?? 0;
  },
};

export default HashtagResolver;
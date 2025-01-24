import { Like, Retweet } from '@prisma/client';
import { ApolloContext } from '../context';
import { TweetResolvers } from '../generated/graphql';

const TweetResolver: TweetResolvers<ApolloContext> = {
  likeCount(tweet) {
    return tweet.likes?.length ?? 0;
  },
  retweetCount(tweet) {
    return tweet.retweets?.length ?? 0;
  },
  replyCount(tweet) {
    return tweet.children?.length ?? 0;
  },
  // properties beginning with _ are relative to the current user
  // i.e. _liked returns if the current user has liked the target tweet
  _liked(tweet, _args, { user }) {
    return (
      user?.likes?.some((like: Like) => like.tweetId === tweet.id) ?? false
    );
  },
  _retweeted(tweet, _args, { user }) {
    return (
      user?.retweets?.some(
        (retweet: Retweet) => retweet.tweetId === tweet.id,
      ) ?? false
    );
  },
};

export default TweetResolver;

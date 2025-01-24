import { Like, Retweet } from '@prisma/client';
import { ApolloContext } from '../context';
import { PostResolvers } from '../generated/graphql';

const PostResolver: PostResolvers<ApolloContext> = {
  _seen(post, _args, { seenPostsCache }) {
    return seenPostsCache?.includes(post.id) ?? false;
  },
};

export default PostResolver;
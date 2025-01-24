import { ApolloContext } from '../context';
import { UserResolvers } from '../generated/graphql';

const UserResolver: UserResolvers<ApolloContext> = {
  handle(user) {
    return `${user.handle}`;
  },
  // properties beginning with _ are relative to the current user
  // i.e. _followed returns if the current user is following the target user
  _followed(user, _args, { user: currentUser }) {
    return currentUser?.following?.some(u => u.id === user.id) ?? false;
  },
  _follower(user, _args, { user: currentUser }) {
    return currentUser?.followers?.some(u => u.id === user.id) ?? false;
  },
  _blocked(user, _args, { user: currentUser }) {
    return currentUser?.blockList?.some(u => u.id === user.id) ?? false;
  },
  _blocker(user, _args, { user: currentUser }) {
    return currentUser?.blockerList?.some(u => u.id === user.id) ?? false;
  },
  _IsVip(user, _args, { user: currentUser }) {
    return currentUser?.vip?.some(u => u.id === user.id) ?? false;
  },
};

export default UserResolver;

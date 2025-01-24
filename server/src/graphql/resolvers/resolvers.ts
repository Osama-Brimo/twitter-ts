import {
  DateTimeResolver,
  JSONResolver,
  JWTResolver,
  NonNegativeIntResolver,
  UUIDResolver,
} from 'graphql-scalars';
import { ApolloContext } from '../context';
import { Resolvers } from '../generated/graphql';
import Mutation from './Mutation';
import Query from './Query';
import TweetResolver from './Tweet';
import UserResolver from './User';
import NotificationResolver from './Notification';
import Subscription from './Subscription';
import PostResolver from './Post';
import SearchableResolvers from './Searchable';
import HashtagResolver from './Hashtag';
import MediaResolver from './Media';

const resolvers: Resolvers<ApolloContext> = {
  // scalars
  DateTime: DateTimeResolver,
  UUID: UUIDResolver,
  NonNegativeInt: NonNegativeIntResolver,
  JSON: JSONResolver,
  JWT: JWTResolver,
  // Q/M/S
  Query: Query,
  Mutation: Mutation,
  Subscription: Subscription,
  // Fields
  User: UserResolver,
  Post: PostResolver,
  Tweet: TweetResolver,
  Media: MediaResolver,
  Hashtag: HashtagResolver,
  Notification: NotificationResolver,
  Searchable: SearchableResolvers,
};

export default resolvers;

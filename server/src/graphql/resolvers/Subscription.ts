import { ApolloContext } from '../context';
import { SubscriptionResolvers } from '../generated/graphql';
import { newNotification } from '../subscriptions/Notification';

const Subscription: SubscriptionResolvers<ApolloContext> = {
  newNotification,
};

export default Subscription;

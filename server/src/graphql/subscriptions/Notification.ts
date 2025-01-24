import { ApolloContext } from '../context';
import { SubscriptionResolvers } from '../generated/graphql';
import { notificationPubsub } from '../mutations/utils/events';


export const newNotification: SubscriptionResolvers<ApolloContext>['newNotification'] = {
  resolve: (payload) => {
    return payload.newNotification;
  },
  subscribe: async (_, { userId }, { user }) => {
    const asyncIterator = notificationPubsub.asyncIterator(`NEW_NOTIFICATION_${userId}`);
    
    return asyncIterator;
  },
};
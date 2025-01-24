import { Like, Retweet } from '@prisma/client';
import { ApolloContext } from '../context';
import { NotificationResolvers } from '../generated/graphql';
import { createNotificationMessage } from '../../utils/helpers';

const NotificationResolver: NotificationResolvers<ApolloContext> = {
  message(notification) {
    return createNotificationMessage(notification) ?? '';
  },
};

export default NotificationResolver;

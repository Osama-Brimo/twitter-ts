import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  InMemoryCacheConfig,
} from '@apollo/client';
// import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { Post, Tweet } from '@/gql/graphql';

// Apollo server forces preflight by default by disabling 'simple' http operations
// (https://www.apollographql.com/docs/apollo-server/security/cors#preventing-cross-site-request-forgery-csrf)
// If we want to upload via mutations, we'd have to use a different apollo link for the client and set Apollo-Require-Preflight header
// However, It's generally still not reccomended to upload files via GraphQL mutations
// In our application, we'll instead use a simple REST api to handle uploads to an S3 bucket
// The code to set up graphql uploads is left on client/server side for illustration

// Create the http link for queries and mutations
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

// Optional graphql-upload setup (this also handles http)
// const uLink = createUploadLink({
//   // TODO: Replace uri with a variable
//   uri: 'http://localhost:4000/graphql',
//   credentials: 'include',
//   headers: {
//     'Apollo-Require-Preflight': 'true',
//   },
// });

// Create the websocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
  }),
);

// Split the link into a websocket link for subscriptions and an httplink (or uLink if using graphql-upload) which handles http
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

// Configure the client cache (https://www.apollographql.com/docs/react/caching/cache-configuration)
const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        // currentUser: {
        //   keyArgs: false,
        //   merge(existing = {}, incoming) {
        //     return incoming;
        //   },
        // },
        allPosts: {
          keyArgs: false,
          merge(existing = [], incoming, { args: { offset = 0 } }) {
            const merged = existing ? existing.slice(0) : [];
            for (let i = 0; i < incoming.length; ++i) {
              merged[offset + i] = incoming[i];
            }
            return merged;
          },
        },
        getPostWithReplies: {
          merge(existing: Post = {}, incoming: Post) {
            const incomingTweet = incoming?.tweet as Tweet;
            const existingTweet = existing?.tweet as Tweet;

            const merged: Post = {
              ...incoming,
              tweet: {
                ...incomingTweet,
                parent: existingTweet?.parent ?? undefined,
                author: existingTweet?.author,
              }
            };
            return merged;
          },
        },
      },
    },
  },
};

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(cacheConfig),
});

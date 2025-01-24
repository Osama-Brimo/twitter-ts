import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
// import { graphqlUploadExpress } from 'graphql-upload-ts';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { useServer } from 'graphql-ws/lib/use/ws';
import http from 'http';
import { WebSocketServer } from 'ws';
import { getUserFromToken } from '../utils/auth';
import { GRAPHQL_SCHEMA_PATH } from '../utils/constants';
import db, { ApolloContext } from './context';
import resolvers from './resolvers/resolvers';

export async function createApolloServer(
  app: express.Application,
  httpServer: http.Server,
): Promise<void> {
  const schema = makeExecutableSchema({
    typeDefs: loadSchemaSync(GRAPHQL_SCHEMA_PATH, {
      loaders: [new GraphQLFileLoader()],
    }),
    resolvers,
  });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx) => {
        return {
          db,
        };
      },
    },
    wsServer,
  );

  const server = new ApolloServer<ApolloContext>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        // Note: This has to be async, even with no awaits
        async serverWillStart() {
          return {
            async drainServer() {
              console.log('Shutting down WebSocket server...');
              await serverCleanup.dispose();
              console.log('WebSocket server shut down');
            },
          };
        },
      },
    ],
    formatError: (formattedError, error) => {
      console.log(`[formatError]:` ,formattedError, error);
      if (formattedError.message.startsWith('Database Error: ')) {
        return new Error('Internal server error');
      }
      return formattedError;
    },
  });

  await server.start();

  // Apollo server forces preflight by default by disabling 'simple' http operations 
  // (https://www.apollographql.com/docs/apollo-server/security/cors#preventing-cross-site-request-forgery-csrf)
  // If we want to upload via mutations, we'd have to use a different apollo link for the client and set the Apollo-Require-Preflight header
  // However, It's generally still not reccomended to upload files via GraphQL mutations
  // In our application, we'll instead use a simple REST api to handle uploads to an S3 bucket
  // The code to set up graphql uploads is left on client/server side for illustration

  // graphql-upload-ts should go directly after graphql if used
  app.use(
    '/graphql',
    // graphqlUploadExpress({
    //   maxFileSize,
    //   maxFiles,
    // }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<ApolloContext> => {
        const token = req.cookies?.jwt_authorization;
        const user = token ? await getUserFromToken(token) : null;

        // console.log('user from server...', user);
        // console.log('token from server...', token);

        return {
          db,
          user,
          seenPostsCache: [],
          res,
        };
      },
    }),
  );
}

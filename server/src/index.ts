import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { exit } from 'process';
import { createApolloServer } from './graphql/server';
import { STATIC_PATH, UPLOADS_PATH } from './utils/constants';
import cookieParser from 'cookie-parser';
import http from 'http';
import mediaRouter from './api/media';

dotenv.config();

export const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT ?? 4000;

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'PUT', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb', parameterLimit: 1000000 }));
app.use('/static', express.static(STATIC_PATH));
app.use('/uploads', express.static(UPLOADS_PATH));
app.use(mediaRouter);

const main = async () => {
  await createApolloServer(app, httpServer);

  httpServer.listen(port, () => {
    console.log(`Express running at: http://localhost:${port}`);
    console.log(`GraphQL running at: http://localhost:${port}/graphql`);
  });
};

main().catch((err) => {
  console.error(err);
  exit(1);
});
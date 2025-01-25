# twitter-ts

A Fullstack responsive social media site built with React, Express/Node.js, Apollo/GraphQL, and ShadCN components. Uses Prisma with Postgres for ORM, and Vite as a build tool.

## ✨ Features
- Twitter-like functionality (Feeds with tweets, retweets, liking, quotes, nested threads, etc.)
- Typescript-integrated monorepo codebase with linting
- S3 and Cloudfront integration for file storage, with signed urls (via REST/Axios)
- Real-time user notifications delivered using a GraphQL Subscription
- User system with JWT token-based authentication (with blocking, privating, and follow requests)
- Interaction logging
- Image upload, and dynamic in-tweet galleries
- Searching, infinite scroll, client-side rate limiting
- Apollo client cache management
- Rich text interaction (dynamic @mentions links, #hashtags, etc.)
- React Hook Form validation with Zod
- Automatic Dark/Light mode switching based on browser theme

## 📆 Planned Features
- Ranking algorithm based on logged interactions
  - 'For you' style feed based on ranking
  - Ranking-based user suggestions
  - 'See less often' feature for posts which demotes ranking
- Instant messaging feature

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Apollo Client for GraphQL
- ShadCn + Tailwind
- React Router v6 for routing

### Backend
- Node.js with Express
- GraphQL with Apollo Server
- PostgreSQL with Prisma ORM
- WebSocket connection for real-time features
- AWS S3 for media storage + Cloudfront for CDN


##  📁 Project Structure
````
├── client/ # Frontend React application
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── context/ # React context providers
│ │ ├── gql/ # GraphQL queries and mutations
│ │ ├── hooks/ # Custom React hooks
│ │ ├── lib/ # Utility functions
│ │ └── routes/ # Application routes
│ └── ...
├── server/ # Backend Node.js application
│ ├── src/
│ │ ├── graphql/ # GraphQL server, schema, and resolvers
│ │ │ ├── generated/ # codegen
│ │ │ ├── mutations/ # All mutations and their utilities
│ │ │ ├── queries/ # All queries and their utilities
│ │ │ ├── subscriptions/ # All subscriptions and their utilities 
│ │ │ ├── resolvers/ # Resolvers for all entitites
│ │ │ ├── context.ts # Apollo context (extended prisma client)
│ │ │ ├── s3.ts # AWS/Cloudfront client
│ │ │ ├── server.ts # Apollo GQL Server
│ │ │ └── utils/ # Server utils and helpers
│ │ ├── api/ # REST endpoints
│ │ ├── utils/ # Utility functions and exports
│ │ └── index.ts # Main Express server
│ └── prisma/ # Db schema, migrations, and extensions
└── shared/ # Shared types and utilities
````

## 🛠 Setup

### Prerequisites
- AWS Account (for S3)
- Cloudfront distribution integrated with S3 bucket
- Signed URLs enabled on Cloudfront (with keypairs)
- Correct user policy setup:
  - GetObject, DeleteObject, PutObject permissions on S3 bucket
  - CreateInvalidation on your Cloudfront distribution

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/twitter-clone.git
cd twitter-ts
```

2. **Install dependencies:**

Install client + server deps at once from monorepo root:

```bash 
npm install
```

3. **Set up environment variables:**

In the `/server` directory, create an `.env` file:

````
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

ACCESS_KEY=""
SECRET_ACCESS_KEY=""

BUCKET_NAME=""
BUCKET_REGION=""

CLOUDFRONT_DISTRIBUTION_ID=""
CLOUDFRONT_DOMAIN_NAME=""
CLOUDFRONT_KEYPAIR_ID=""
CLOUDFRONT_PRIVATE_KEY=""
````

4. **Initialize Database:**

From monorepo root:

```bash
cd server
# Generate prisma client
npx prisma generate
# Run migrations
npx prisma migrate dev
# Seed database
npm run seed
```

5. **Start dev servers:**

From monorepo root:

```bash
# runs Vite + GraphQL server together using concurrently
npm run dev
```

```bash
# Runs codegen
npm run codegen
```
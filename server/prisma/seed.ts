import { PrismaClient, User, Tweet, PostType, GalleryType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { exit } from 'node:process';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const fLorem = faker.lorem;
const fInternet = faker.internet;
const fPerson = faker.person;
const fImage = faker.image;
const fDate = faker.date;

const NUM_USERS = 10;
const MAX_TWEETS_PER_USER = 10;
const MAX_LIKES_PER_USER = 10;
const MAX_RETWEETS_PER_USER = 5;
const MAX_QUOTES_PER_USER = 5;
const MAX_VIPS_PER_USER = 5;

async function main() {
  const users: User[] = [];
  const tweets: Tweet[] = [];

  // Create users
  for (let i = 0; i < NUM_USERS; i++) {
    const user = await prisma.user.create({
      data: {
        name: fPerson.fullName(),
        email: fInternet.email(),
        password: bcrypt.hashSync('password', 10),
        bio: fLorem.sentence(),
        website: fInternet.url(),
        handle: fInternet.userName(),
      },
    });
    users.push(user);
  }

  // Create tweets and associated posts for each user
  for (const user of users) {
    const numTweets = faker.number.int({ min: 1, max: MAX_TWEETS_PER_USER });
    for (let i = 0; i < numTweets; i++) {
      const createdAt = fDate.past();
      // Create Post first
      const post = await prisma.post.create({
        data: {
          type: PostType.TWEET,
          author: { connect: { id: user.id } },
          createdAt,
        },
      });

      // Create Tweet connected to Post
      const tweet = await prisma.tweet.create({
        data: {
          content: fLorem.paragraph(),
          author: { connect: { id: user.id } },
          post: { connect: { id: post.id } },
          meta: { create: { galleryType: GalleryType.QUILT } },
          createdAt,
        },
      });
      tweets.push(tweet);
    }
  }

  // Create likes, retweets, and quotes
  for (const user of users) {
    // Likes
    const numLikes = faker.number.int({ min: 0, max: MAX_LIKES_PER_USER });
    const likePosts = faker.helpers.arrayElements(tweets, numLikes);
    for (const tweet of likePosts) {
      await prisma.like.create({
        data: {
          tweet: { connect: { id: tweet.id } },
          user: { connect: { id: user.id } },
        },
      });
    }

    // Retweets with associated posts
    const numRetweets = faker.number.int({
      min: 0,
      max: MAX_RETWEETS_PER_USER,
    });
    const retweetTweets = faker.helpers.arrayElements(tweets, numRetweets);
    for (const tweet of retweetTweets) {
      const createdAt = fDate.past();
      // Create Post for retweet
      const post = await prisma.post.create({
        data: {
          type: PostType.RETWEET,
          author: { connect: { id: user.id } },
          createdAt,
        },
      });

      // Create Retweet connected to Post
      await prisma.retweet.create({
        data: {
          createdAt,
          post: { connect: { id: post.id } },
          tweet: { connect: { id: tweet.id } },
          user: { connect: { id: user.id } },
        },
      });
    }

    // Quotes (which are tweets that reference other tweets)
    const numQuotes = faker.number.int({ min: 0, max: MAX_QUOTES_PER_USER });
    const quoteTweets = faker.helpers.arrayElements(tweets, numQuotes);
    for (const tweet of quoteTweets) {
      const createdAt = fDate.past();
      // Create Post for quote tweet
      const post = await prisma.post.create({
        data: {
          type: PostType.TWEET,
          author: { connect: { id: user.id } },
          createdAt,
        },
      });

      // Create Quote Tweet connected to Post
      await prisma.tweet.create({
        data: {
          content: fLorem.paragraph(),
          createdAt,
          post: { connect: { id: post.id } },
          quoting: { connect: { id: tweet.id } },
          author: { connect: { id: user.id } },
          meta: { create: { galleryType: GalleryType.QUILT } }
        },
      });
    }
  }

  // Assign VIPs to users
  for (const user of users) {
    const numVips = faker.number.int({ min: 0, max: MAX_VIPS_PER_USER });
    const vipUsers = faker.helpers.arrayElements(
      users.filter((u) => u.id !== user.id),
      numVips,
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        vip: {
          connect: vipUsers.map((u) => ({ id: u.id })),
        },
      },
    });
  }

  console.log(`Seeded ${users.length} users and ${tweets.length} tweets`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    exit(1);
  });

import { DocumentNode } from 'graphql';
import {
  type Post,
  type Tweet,
  type Like,
  type User,
  type Media,
  type SearchResult,
} from '../gql/graphql';
import { QueryResult } from '@apollo/client';
import { ShadCnCardProps } from '@/components/ui/card';

export interface Styles {
  [key: string]: React.CSSProperties;
}

/**
 * Types of galleries that can shown for a tweet's attached media.
 *
 * @enum `CAROUSEL` - A carousel used for more than 4 images.
 * @enum `QUILT` - A grid used for 4 or fewer images with different sizings based on order and amount.
 */
export enum GalleryType {
  CAROUSEL = 'CAROUSEL',
  QUILT = 'QUILT',
}

export enum TweetPreviewContext {
  reply = 'reply',
  quoted = 'quoted',
  retweet = 'retweet',
  threadParent = 'threadParent',
  replyDialog = 'replyDialog',
  quoteDialog = 'quoteDialog',
}

/**
 * Client-side type for Multer file
 */
export interface UploadedFileInfo {
  key: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Generics
/**
 * Entities that can fit into a tweet container, and be provided to `<DisplayPostFeed/>`.
 */
export type DisplayPostItem = Post | Tweet | Like;
/**
 * Entities that can be shown as part of any feed, and passed to `<Feed/>`.
 */
export type FeedItem = Post | Tweet | Like | Media | User;
/**
 * Types of 'containers' that a {@link FeedDisplayItemTypes} item uses (like a tweet, user card, media card).
 */
export type FeedDisplayTypes = 'post' | 'user' | 'media';
/**
 * Types of items that fit into {@link FeedDisplayTypes} (i.e: a like shows up as a list of tweets)
 */
export type FeedDisplayItemTypes = 'post' | 'tweet' | 'like' | 'user';

// Specifics
/**
 *  Types of data a search can display within one feed.
 */
export type SearchFeedDisplayTypes = Exclude<FeedDisplayTypes, 'media'>;

// Feed Types
/**
 * Variety of feeds `<Profile/>` can display.
 */
export type ProfileFeedTypes = 'posts' | 'likes' | 'followers' | 'following';
/**
 * Variety of feeds `<Home/>` can display.
 */
export type HomeFeedTypes = 'foryou' | 'following' | 'discover';

/**
 * A function which calls a GraphQL query to populate a feed, and performs any required state setting (such as setting feed types, etc.).
 * @argument force - Execute handler with no checks.
 */
export type FeedQueryHandler = (force?: boolean) => void;

export interface BaseFeedQueryHandlers {
  [key: string]: FeedQueryHandler;
}
export interface HomeFeedQueryHandlers extends BaseFeedQueryHandlers {
  handleFeedForYou: (force?: boolean) => Promise<void>;
  handleFeedDiscover: (force?: boolean) => void;
  handleFeedFollowing: (force?: boolean) => void;
}

export interface ProfileFeedQueryHandlers extends BaseFeedQueryHandlers {
  handleViewPosts: (force?: boolean) => Promise<void>;
  handleViewLikes: (force?: boolean) => Promise<void>;
  handleViewFollowers: (force?: boolean) => Promise<void>;
  handleViewFollowing: (force?: boolean) => Promise<void>;
}

export interface SearchFeedQueryHandlers extends BaseFeedQueryHandlers {
  searchPostsHandler: (force?: boolean) => Promise<void>;
  searchUsersHandler: (force?: boolean) => Promise<void>;
}

// Prop types
interface FetchMoreVars {
  [key: string]: any;
}

// Temp custom class for a json error message, because the GraphQLError refuses to work for some reason  
export interface GraphQLErrorCustomJsonMsg {
  message: string;
  code: string;
  field?: string;
}

export interface FeedProps {
  /**
   * What the feed should display (like a tweet, user card, media card).
   *
   * @type string
   * @enum see {@link FeedDisplayTypes}
   */
  displayType: FeedDisplayTypes;
  /**
   * What the actual items that will be going into the feed will be (a `Like`, `User`, `Post`, etc.).
   *
   * @type string
   * @enum see {@link FeedDisplayItemTypes}
   */
  itemType: FeedDisplayItemTypes;
  /**
   * The GraphQL query used to populate the feed.
   *
   * @type DocumentNode
   */
  query: DocumentNode;
  /**
   * The name of the GraphQL query used to populate the feed.
   *
   * @type string
   */
  queryName: string;
  /**
   * The GraphQL query result.
   *
   * @type QueryResult
   */
  queryResult: QueryResult;
  /**
   * Whether the feed is displaying a search result. This must be specified since the query response will be a {@link SearchResult} which has a different structure.
   *
   * @default false
   * @type QueryResult
   */
  queryIsSearch?: boolean;
  /**
   * Any variables required to call `fetchMore` on the provided query.
   *
   * `offset` and `limit` are automatically handled; only additional variables should be provided.
   *
   * @type QueryResult
   */
  fetchMoreVars?: FetchMoreVars;
  /**
   * How many items the feed should show at a time before calling `fetchMore`.
   *
   * Used as the `limit` when calling `fetchMore`.
   *
   * @default 15
   * @type number
   */
  itemsPerPage?: number;
  /**
   * An optional label to show the user describing the feed contents, shown at the top of the feed.
   *
   * @type {string}
   * @memberof FeedProps
   */
  feedLabel?: string;
  children?: React.ReactNode;
}

/**
 * (Not related to `meta` property on `Tweet`)
 *
 * This type is used to describe info that must be conveyed to subcomponents about the context of the tweet they are in.
 *
 * (i.e: to tell a `<Tweet/>` component that it is rendering as a quote inside another tweet, or to tell `<LikeButton/>` the query so it can update cache after mutating).
 */
export interface TweetMetaInfo {
  /**
   * The `id` of the `Tweet`'s `Post`.
   * 
   * @type string
   */
  postId: string;
  /**
   * The tweet's `Post` container.
   *
   * @type {Post}
   * @memberof TweetMetaInfo
   */
  post?: Post,
  /**
   * Retweeter's `name`, if any. Used when {@link previewContext} is set to `retweet`.
   * @type string | undefined
   * @default undefined
   */
  retweeterName?: string;
  /**
   * Retweeter's `id`, if any. Used when {@link previewContext} is set to `retweet`.
   *
   * @type string | undefined
   * @default undefined
   */
  retweeterId?: string;
  /**
   * The context within which a tweet is being displayed. It should be specified on the closest level possible, directly on the tweet.
   *
   * By default, assumes a normal context (plain tweet or quote tweet within a regular feed).
   *
   * @example
   * ```tsx
   * // Wrong
   * <Thread meta={{ ...meta, previewContext: 'thread' }} />
   *
   * // Right
   * <Thread meta={meta} />
   * // ...then inside Thread.tsx
   * <Tweet meta={{ ...meta, previewContext: 'thread' }}>
   * ```
   *
   * @type string | undefined
   * @enum `reply` - As a reply (`children`) of another tweet.
   * @enum `quoted` - As a quoted tweet (`quoteOf`) inside another tweet.
   * @enum `retweet` - As a retweet.
   * @enum `threadParent` - The parent tweet within a dialog (popup showing replies, full size gallery, etc.).
   * @enum `replyDialog` - Inside a dialog shown when user wants to reply to tweet.
   * @enum `quoteDialog` - Inside a dialog shown when user wants to quote tweet.
   * @default undefined - Assumed to be a regular tweet.
   */
  previewContext?: TweetPreviewContext;
  /**
   * The name of the GraphQL query from which the tweet originates. Used mainly to allow subcomponents to reference and update query cache.
   *
   * For example, the home feed might have used the 'allPosts' query to fetch this tweet.
   * @type string
   * @default undefined
   */
  queryName?: string;
  /**
   * The name of the GraphQL query which the tweet originates. Used mainly to allow subcomponents to reference and update query cache.
   *
   * For example, the home feed might have used the 'allPosts' query to fetch this tweet.
   * @type DocumentNode
   * @default undefined
   */
  query?: DocumentNode;
}

/**
 * All the info required to display any tweet in any context.
 */
export interface TweetDisplay extends ShadCnCardProps {
  /**
   * The key to use if the tweet has siblings and requires a key.
   *
   * @type string | undefined
   * @default undefined
   */
  key?: string;
  /**
   * The tweet data.
   *
   * @type Tweet
   */
  tweet: Tweet;
  /**
   * (Not related to `meta` property on `Tweet` model)
   *
   * Info that must be conveyed to subcomponents about the context of the tweet they are in.
   *
   * (i.e: to tell a `<Tweet/>` component that it is rendering as a quote inside another tweet, or to tell `<LikeButton/>` the query so it can update cache after mutating).
   *
   * @type TweetMetaInfo
   */
  meta: TweetMetaInfo;
}

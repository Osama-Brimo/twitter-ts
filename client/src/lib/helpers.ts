import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import { UserPayload } from '@/gql/graphql';
import { PostType as PostTypeEnum } from '@/gql/graphql';
import { type Post as PostType, type Media as MediaType } from '@/gql/graphql';
import {
  FeedDisplayTypes,
  ProfileFeedTypes,
  TweetDisplay,
  TweetMetaInfo,
  UploadedFileInfo,
} from './types';
import { DocumentNode } from 'graphql';

type AcceptableFileTypes = 'image/';

type AccpetableMimeTypes = {
  [key in AcceptableFileTypes]: string[];
};

export function readableDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export const readableFileSize = (size: number) => {
  // Calculate total size
  let numberOfBytes = 0;
  numberOfBytes += size;

  // Approximate to the closest prefixed unit
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  const exponent = Math.min(
    Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
    units.length - 1,
  );
  const approx = numberOfBytes / 1024 ** exponent;
  const output =
    exponent === 0
      ? `${numberOfBytes} bytes`
      : `${approx.toFixed(1)} ${units[exponent]}`;

  return output;
};

export const checkFileExtensionAllowed = (
  accept: AccpetableMimeTypes,
  check: string,
) => {
  const keys = Object.keys(accept) as AcceptableFileTypes[];

  return keys.find((t: AcceptableFileTypes) =>
    accept[t].find(
      (extension) => `${t.toLowerCase()}${extension.toLowerCase()}` === check,
    ),
  );
};

export const getExtensionFromMimetype = (mimeType: string): string | false => {
  const match = mimeType.match(/^[\w-]+\/([\w-]+)$/);
  return match ? match[1] : false;
};

export const returnTweetBoxLabels = (context: 'post' | 'reply' | 'quote') => {
  const results = {
    placeholder: '',
    buttonLabel: '',
  };
  switch (context) {
    case 'post':
      results.placeholder = 'What is happening?';
      results.buttonLabel = 'Post';
      break;
    case 'reply':
      results.placeholder = 'Post your reply';
      results.buttonLabel = 'Reply';
      break;
    case 'quote':
      results.placeholder = 'Add a comment';
      results.buttonLabel = 'Post';
      break;
    default:
      results.placeholder = 'What is happening?';
      results.buttonLabel = 'Post';
      break;
  }

  return results;
};

export const setAuthCookieFromData = (userPayload: UserPayload) => {
  const { token } = userPayload;
  const cookie = new Cookies();

  if (token) {
    const decodedToken = jwtDecode(token);
    console.log('decodedToken');
    console.log(decodedToken);
    if (decodedToken) {
      const expires = new Date(decodedToken.exp * 1000);
      cookie.set('jwt_authorization', token, {
        expires,
      });
    }
  }
};

//
export const getViewTypeFromPath = (path: string): ProfileFeedTypes => {
  const regex = /^\/([^/]+)(?:\/(likes|followers|following))?$/;

  const match = path.match(regex);
  if (match) {
    // const handle = match[1]; // e.g., 'some.handle'
    const section = (match[2] || 'posts') as ProfileFeedTypes; // Fallback on 'posts'
    return section;
  } else {
    return 'posts';
  }
};

export const getDisplayDataFromPost = (
  post: PostType,
  query: DocumentNode,
  queryName: string,
): TweetDisplay => {
  const meta: TweetMetaInfo = {
    postId: post.id,
    query,
    queryName,
  };

  if (post.tweet?.content === 'da parent') {
    console.log('[da post]:', post);
  }

  switch (post.type) {
    case PostTypeEnum.Retweet:
      return {
        key: post.id,
        tweet: post.retweet?.tweet,
        meta: {
          ...meta,
          previewContext: 'retweet',
          retweeterId: post.authorId,
          retweeterName: post.author?.name,
          post: post.retweet?.tweet?.post,
        },
      };
    case PostTypeEnum.Tweet:
      return {
        key: post.id,
        tweet: post.tweet,
        meta: {
          ...meta,
          post,
        },
      };
  }
};

export const getFeedDisplayType = (
  viewType: ProfileFeedTypes,
): FeedDisplayTypes => {
  switch (viewType) {
    case 'posts':
      return 'post';
    case 'followers':
      return 'user';
    case 'following':
      return 'user';
    case 'likes':
      return 'post';
    default:
      return 'post';
  }
};

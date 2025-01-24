export const MAX_FILE_SIZE = 5242880; // 5 MiB
// In a real application, this kind of info would be either set per resource/type (i.e: TWEET_MAX_IMAGE_COUNT, TWEET_ALLOWED_MIMETYPES, etc.)
// or we can set limits dynamically on the component level if needed. For our purposes however, this is enough.
export const MAX_FILE_COUNT = 6;
export const ALLOWED_MIMETYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/svg', 'image/gif'];
export const ALLOWED_EXTENSIONS = '.jpg, .jpeg, .png, .svg, .gif';
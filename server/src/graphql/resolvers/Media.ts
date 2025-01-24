import { GraphQLError } from 'graphql';
import { ApolloContext } from '../context';
import { MediaResolvers } from '../generated/graphql';
import { getObjectSignedUrl } from '../s3';

const MediaResolver: MediaResolvers<ApolloContext> = {
  url({ key, filename, id }, _args, _context) {
    try {
      if (!key) {
        console.error(
          `[MediaResolver]: No key found when trying to resolve url from media with filename: ${filename} and id: ${id}.`,
        );
        return '';
      }

      return getObjectSignedUrl(key);
    } catch (error) {
      throw new GraphQLError(error);
    }
  },
};

export default MediaResolver;

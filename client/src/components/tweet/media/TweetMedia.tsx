import { type Media as MediaType } from '@/gql/graphql';
import { useMemo } from 'react';
import { GalleryType } from '@/lib/types';
import MediaCarousel from './MediaCarousel';
import MediaQuilt from './MediaQuilt';

interface TweetMediaProps {
  media: MediaType[];
  dialogHandler: () => void;
  galleryType: GalleryType;
}

const TweetMedia = ({ media, dialogHandler, galleryType }: TweetMediaProps) => {
  const toShow = useMemo(() => {
    switch (galleryType) {
      case GalleryType.CAROUSEL:
        return <MediaCarousel dialogHandler={dialogHandler} media={media} />;
      case GalleryType.QUILT:
        return <MediaQuilt dialogHandler={dialogHandler} media={media} />;
      default:
        return <MediaCarousel dialogHandler={dialogHandler} media={media} />;
    }
  }, [dialogHandler, galleryType, media]);

  return <div>{toShow}</div>;
};

export default TweetMedia;

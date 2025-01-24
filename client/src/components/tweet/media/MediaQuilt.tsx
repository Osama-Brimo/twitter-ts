import { AspectRatio } from '@/components/ui/aspect-ratio';
import { type Media as MediaType } from '@/gql/graphql';

interface MediaQuiltProps {
  media: MediaType[];
  dialogHandler: () => void;
}

const MediaQuilt = ({ media, dialogHandler }: MediaQuiltProps) => {
  return (
    <AspectRatio className="mt-4 relative w-full" ratio={16 / 9}>
      <div
        className={`grid h-full w-full gap-1 rounded-lg overflow-hidden ${
          media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        }`}
        onClick={dialogHandler}
      >
        {media.map((item, index) => (
          <div
            key={item.url}
            className={`relative overflow-hidden ${
              media.length === 3 && index === 0 ? 'row-span-2' : ''
            }`}
          >
            <img
              src={item.url}
              alt={item.filename || ''}
              className="absolute h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </AspectRatio>
  );
};

export default MediaQuilt;

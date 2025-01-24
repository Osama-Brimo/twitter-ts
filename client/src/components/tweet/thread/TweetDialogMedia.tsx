import { type Media as MediaType } from '@/gql/graphql';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface TweetDialogMediaProps {
  media?: MediaType[];
  dialogHandler: () => void;
}

interface CarouselDotsProps {
  count: number;
  current: number;
  active: boolean;
  setSlide: (n: number) => void;
}

const CarouselDots = ({
  count,
  current,
  setSlide,
  active = false,
}: CarouselDotsProps) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full cursor-pointer transition-colors
              ${i + 1 === current ? 'bg-white' : 'bg-white/50'}`}
            onClick={() => setSlide(i)}
          />
        ))}
      </div>
      <small
        className={`text-white ${active ? 'opacity-100' : 'opacity-0'} transition-opacity`}
      >
        {current} of {count}
      </small>
    </div>
  );
};

const TweetDialogMedia = ({ media, dialogHandler }: TweetDialogMediaProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  const setSlide = useCallback(
    (n: number) => {
      if (api) {
        api.scrollTo(n);
        setCurrent(n + 1);
      }
    },
    [api],
  );

  if (!media?.length) return null;

  // Single image view
  if (media.length === 1) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <Link to={media[0].url} target="_blank">
          <div className="h-full">
            <img
              src={media[0].url}
              className="object-cover"
              alt={media[0].filename || 'image'}
            />
          </div>
        </Link>
      </div>
    );
  }

  // Carousel view
  return (
    <div
      onMouseEnter={() => {
        setActive(true);
      }}
      onMouseLeave={() => {
        setActive(false);
      }}
      className="max-h-full h-full bg-black"
    >
      <Carousel
        setApi={setApi}
        className="h-full max-h-full"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full max-h-full">
          {media.map((item, index) => (
            <CarouselItem
              key={index}
              className="h-full max-h-full cursor-pointer"
            >
              <Link to={item.url} target="_blank">
                <div className="h-full">
                  <img
                    src={item.url}
                    className="object-cover"
                    alt={item.filename || 'image'}
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${active ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        />
        <CarouselNext
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${active ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        />
        <CarouselDots
          current={current}
          count={count}
          setSlide={setSlide}
          active={active}
        />
      </Carousel>
    </div>
  );
};

export default TweetDialogMedia;

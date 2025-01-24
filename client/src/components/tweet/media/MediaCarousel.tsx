import { type Media as MediaType } from '@/gql/graphql';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useCallback, useEffect, useState } from 'react';

interface MediaCarouselProps {
  media: MediaType[];
  dialogHandler: () => void;
}

interface CarouselDotsProps {
  count: number;
  current: number;
  setSlide: (n: number) => void;
  carouselActive: boolean;
}

const CarouselDots = ({
  count,
  current,
  setSlide,
  carouselActive,
}: CarouselDotsProps) => {
  return (
    <div className="pt-4 text-center text-sm text-muted-foreground flex flex-col justify-center">
      <div
        className={`flex justify-center ${carouselActive ? 'opacity-100' : 'opacity-50'} transition-opacity`}
      >
        {Array.from({ length: count }).map((_, i) => {
          const active =
            i + 1 === current ? 'bg-primary' : 'bg-muted-foreground';
          return (
            <div
              key={i}
              className={`h-2.5 w-2.5 mx-1 rounded-full ${active}`}
              onClick={() => setSlide(i)}
            />
          );
        })}
      </div>
      <div>
        <small
          className={`${carouselActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        >
          {current} of {count}
        </small>
      </div>
    </div>
  );
};

const MediaCarousel = ({
  media,
  dialogHandler,
}: MediaCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, setCurrent]);

  const setSlide = useCallback(
    (n: number) => {
      if (api && typeof n === 'number') {
        api.scrollTo(n + 1);
        setCurrent(n + 1);
      }
    },
    [api, setCurrent],
  );

  useEffect(() => {
    console.log(`TweetMedia useEffect`, current, setCurrent);
  }, [current, setCurrent])
  

  return (
    <div
      onMouseEnter={() => {
        setActive(true);
      }}
      onMouseLeave={() => {
        setActive(false);
      }}
    >
      <div className="mx-auto px-10 pt-5">
        <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {media.map((item, index) => {
              const { url } = item;
              return (
                <CarouselItem
                  key={index}
                  className="w-full h-full"
                  onClick={dialogHandler}
                >
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    <img
                      src={url}
                      className="h-full w-full rounded-md object-contain"
                    />
                  </AspectRatio>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div
            className={`${active ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          >
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
        <CarouselDots
          current={current}
          count={count}
          carouselActive={active}
          setSlide={setSlide}
        />
      </div>
    </div>
  );
};

export default MediaCarousel;

import { Skeleton } from '@/components/ui/skeleton';

type SkeletonType = 'card' | 'user' | 'text';

interface SkeletonContentProps {
  type?: SkeletonType;
  repeat?: number;
}

const SkeletonBody = ({ type }: { type: SkeletonType }) => {
  return (
    <>
      {type === 'card' && (
        <div className="flex flex-col space-y-3 mb-4">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
      {type === 'user' && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
      {type === 'text' && (
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
    </>
  );
};

const SkeletonContent = ({ type, repeat }: SkeletonContentProps) => {
  return (
    <>
      {[...Array(repeat)].map((_el, i) => (
        <SkeletonBody key={i} type={type ?? 'card'} />
      ))}
    </>
  );
};

export default SkeletonContent;

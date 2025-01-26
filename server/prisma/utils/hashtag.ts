import { Prisma } from '@prisma/client';
import { SearchResult } from '../../src/graphql/generated/graphql';
import { Order } from '../types';
import db from '../../src/graphql/context';

// Read

export const HashtagExtension = Prisma.defineExtension({
  name: 'Hashtag',
  model: {
    user: {
      // Read
      async searchHashtagsAndCount<T>(
        this: T,
        order: Order = 'desc',
        limit = 0,
        offset = 0,
        q: string,
      ): Promise<SearchResult> {
        const context = Prisma.getExtensionContext(this);
        const query: Prisma.HashtagFindManyArgs = {
          orderBy: { hashtag: order },          
        };
        
        const where = { hashtag: { contains: q } };

        query.where = where;
        limit && (query.take = limit);
        offset && (query.skip = offset);

        const [result, count] = await db.$transaction([
          (context as any).findMany(query),
          (context as any).count({ where }),
        ]);
        
        return { result, count };
      },
    },
  },
});

export default HashtagExtension;

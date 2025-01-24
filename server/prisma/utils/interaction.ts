import { Interaction, Prisma } from '@prisma/client';

export const InteractionExtension = Prisma.defineExtension({
  name: 'Interaction',
  model: {
    interaction: {
      // Create
      async createInteraction<T>(
        this: T,
        { originatorId, recepientId, postId, type },
      ) {
        const context = Prisma.getExtensionContext(this);
        const q: Prisma.InteractionCreateArgs = {
          data: {
            post: { connect: { id: postId } },
            originator: { connect: { id: originatorId } },
            recepient: { connect: { id: recepientId } },
            type,
          },
        };
        const results: Interaction = await (context as any).create(q);
        return results;
      },
    },
  },
});

export default InteractionExtension;

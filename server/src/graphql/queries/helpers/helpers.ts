import { GraphQLError } from 'graphql';
import { ApolloContext } from '../context';
import { Prisma, User } from '@prisma/client';

export function findModelIntersection(arrA: any[], arrB: any[]) {
  return arrA.filter((a) => arrB.find((b) => a.id === b.id));
}

/**
 * Gets users that the target user has recently interacted with
 *
 * @param targetUser - The user to get interactions for
 * @param db - Database client
 * @returns Array of handles of users interacted with, sorted by frequency
 */
export async function getRecentlyInteracted(
  targetUser: User,
  db: ApolloContext['db'],
  interactionRange = 80,
): Promise<string[]> {
  try {
    if (!targetUser?.id) {
      throw new GraphQLError('[getRecentlyInteracted]: Target user not found.');
    }

    console.log(
      '[getRecentlyInteracted] Getting recent interactions for:',
      targetUser.handle,
    );

    // Get last `interactionRange` interactions where user was originator
    const recentInteractions = await db.interaction.findMany({
      where: {
        originatorId: targetUser.id,
        recepient: {
          AND: [
            // Exclude blocked/blocking users
            { blockerList: { none: { id: targetUser.id } } },
            { blockList: { none: { id: targetUser.id } } },
            // Exclude if already following
            { followers: { none: { id: targetUser.id } } },
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: interactionRange,
      include: {
        recepient: {
          include: {
            blockerList: true,
            blockList: true,
            followers: true,
          },
        },
      },
    });

    // Count interactions per user
    const interactionCounts = new Map<string, number>();
    recentInteractions.forEach((interaction) => {
      const handle = interaction.recepient.handle;
      interactionCounts.set(handle, (interactionCounts.get(handle) || 0) + 1);
    });

    // Sort by count and take top 2
    const sortedHandles = Array.from(interactionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([handle]) => handle);

    console.log('[getRecentlyInteracted] Found handles:', sortedHandles);
    return sortedHandles;
  } catch (error) {
    console.error('[getRecentlyInteracted] Error:', error);
    return [];
  }
}

/**
 * Gets users that the target user's mutuals follow
 *
 * @param targetUser - The user to get mutual followers for
 * @param db - Database client
 * @param followersCount - How many followers to grab from each mutual. Default 2
 * @returns Array of handles of mutual's followed users
 */
export async function getWhoMutualsFollow(
  targetUser: User,
  db: ApolloContext['db'],
  followersCount = 2,
): Promise<string[]> {
  try {
    if (!targetUser?.id) {
      throw new GraphQLError('[getWhoMutualsFollow]: Target user not found.');
    }

    console.log(
      '[getWhoMutualsFollow] Getting mutual follows for:',
      targetUser.handle,
    );

    // Get mutuals (users who follow targetUser and are followed by targetUser)
    const mutuals = await db.user.findMany({
      where: {
        AND: [
          { followers: { some: { id: targetUser.id } } },
          { following: { some: { id: targetUser.id } } },
          // Exclude blocked/blocking users
          { blockerList: { none: { id: targetUser.id } } },
          { blockList: { none: { id: targetUser.id } } },
        ],
      },
      include: {
        following: {
          where: {
            AND: [
              { blockerList: { none: { id: targetUser.id } } },
              { blockList: { none: { id: targetUser.id } } },
            ],
          },
        },
      },
    });

    const handles: string[] = [];
    for (const mutual of mutuals) {
      // Get someone the mutual follows that targetUser doesn't
      const suggestion = mutual.following.find(
        (f) =>
          !targetUser.following?.some((tf) => tf.id === f.id) &&
          f.id !== targetUser.id,
      );

      if (suggestion) {
        handles.push(suggestion.handle);
        if (handles.length >= followersCount) break;
      }
    }

    console.log('[getWhoMutualsFollow] Found handles:', handles);
    return handles;
  } catch (error) {
    console.error('[getWhoMutualsFollow] Error:', error);
    return [];
  }
}

/**
 * Gets users who follow the target user but aren't followed back
 *
 * @param targetUser - The user to get potential mutuals for
 * @param db - Database client
 * @param take - How many potential mutuals to find
 * @returns Array of handles of potential mutual followers
 */
export async function getPotentialMutuals(
  targetUser: User,
  db: ApolloContext['db'],
  take: number,
): Promise<string[]> {
  try {
    if (!targetUser?.id) {
      throw new GraphQLError('[getPotentialMutuals]: Target user not found.');
    }

    console.log(
      '[getPotentialMutuals] Getting potential mutuals for:',
      targetUser.handle,
    );

    const followers = await db.user.findMany({
      where: {
        AND: [
          { following: { some: { id: targetUser.id } } },
          { followers: { none: { id: targetUser.id } } },
          // Exclude blocked/blocking users
          { blockerList: { none: { id: targetUser.id } } },
          { blockList: { none: { id: targetUser.id } } },
        ],
      },
      take: take ?? undefined,
    });

    const handles = followers.map((f) => f.handle);
    console.log('[getPotentialMutuals] Found handles:', handles);
    return handles;
  } catch (error) {
    console.error('[getPotentialMutuals] Error:', error);
    return [];
  }
}

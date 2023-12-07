import prisma from './prisma';
import {
  getNewReactions,
  getCasts,
  getNewRootCasts,
  getNewChildrenCasts,
  getUsers,
} from './providers/farcaster';
import { CastsQueryResult } from './types';
import { binarySearch } from './utils';

const FROM_DATE = new Date('2023-11-15T00:00:00.000Z');

const toPackagedCast = (cast: CastsQueryResult) => {
  const hashHex = `0x${cast.hash.toString('hex')}`;
  const parentHash = cast.parent_hash ? `0x${cast.parent_hash.toString('hex')}` : null;
  const rootParentHash = cast.root_parent_hash
    ? `0x${cast.root_parent_hash.toString('hex')}`
    : null;
  return {
    fid: cast.fid,
    id: hashHex,
    text: cast.text,
    timestamp: cast.timestamp,
    embeds: cast.embeds.map((embed) => embed.url),
    mentions: cast.mentions,
    mentionsPositions: cast.mentions_positions,
    parentUrl: cast.parent_url,
    parentHash,
    rootParentHash,
    hash: hashHex,
  };
};

const syncCastChildren = async (casts: CastsQueryResult[], fids: bigint[], parentHash: Buffer) => {
  const children = casts.filter((cast) => cast.parent_hash?.equals(parentHash));

  const childrenToIndex = children.filter((cast) => binarySearch(fids, cast.fid) !== -1);
  console.log('childrenToIndex.length', childrenToIndex.length);

  if (childrenToIndex.length > 0) {
    await prisma.packagedCast.createMany({
      data: childrenToIndex.map(toPackagedCast),
      skipDuplicates: true,
    });

    for (const child of childrenToIndex) {
      await syncCastChildren(casts, fids, child.hash);
    }
  }
};

const syncAllCasts = async () => {
  const fids = (
    await prisma.user.findMany({
      select: {
        fid: true,
      },
      orderBy: {
        fid: 'asc',
      },
    })
  ).map((user) => user.fid);

  const casts = await getCasts({ fromDate: FROM_DATE });

  const rootCasts = casts.filter((cast) => cast.parent_hash === null);

  await prisma.packagedCast.createMany({
    data: rootCasts.filter((cast) => binarySearch(fids, cast.fid) !== -1).map(toPackagedCast),
    skipDuplicates: true,
  });

  for (let i = 0; i < rootCasts.length; i += 1) {
    console.log(`Indexing root cast ${i + 1}/${rootCasts.length}`);
    const cast = rootCasts[i];
    await syncCastChildren(casts, fids, cast.hash);
  }
};

export const resyncAll = async () => {
  // Get all FIDs that aren't indexed yet
  const users = await getUsers();
  const indexedFids = (
    await prisma.user.findMany({
      select: {
        fid: true,
      },
      orderBy: {
        fid: 'asc',
      },
    })
  ).map((user) => user.fid);

  const usersToIndex = users.filter((user) => binarySearch(indexedFids, user.fid) === -1);

  console.log(`Indexing ${usersToIndex.length} out of sync users`);

  await prisma.user.createMany({
    data: usersToIndex,
    skipDuplicates: true,
  });

  await syncAllCasts();
};

// Index all casts from a specified date
export const syncCasts = async () => {
  const tableIsEmpty = (await prisma.packagedCast.count()) === 0;

  const fids = (
    await prisma.user.findMany({
      select: {
        fid: true,
      },
      orderBy: {
        fid: 'asc',
      },
    })
  ).map((user) => user.fid);

  if (tableIsEmpty) {
    console.log('Table is empty, indexing all casts');

    await syncAllCasts();
  } else {
    const latestCastTimestamp = (
      await prisma.packagedCast.aggregate({
        _max: {
          timestamp: true,
        },
      })
    )._max.timestamp;

    console.log('latestCastTimestamp', latestCastTimestamp);
    const rootCasts = await getNewRootCasts(latestCastTimestamp || FROM_DATE);

    console.log(`Indexing ${rootCasts.length} new root casts...`);

    await prisma.packagedCast.createMany({
      data: rootCasts.filter((cast) => binarySearch(fids, cast.fid) !== -1).map(toPackagedCast),
      skipDuplicates: true,
    });

    const indexedCastIds = (
      await prisma.packagedCast.findMany({
        select: {
          id: true,
        },
      })
    ).map((cast) => cast.id);

    const childrenCasts = await getNewChildrenCasts(latestCastTimestamp || FROM_DATE);

    console.log(`Indexing ${childrenCasts.length} replies...`);

    await prisma.packagedCast.createMany({
      data: childrenCasts
        .filter((cast) =>
          indexedCastIds.some(
            (indexedCastId) => `0x${cast.hash.toString('hex')}` === indexedCastId,
          ),
        )
        .map(toPackagedCast),
      skipDuplicates: true,
    });
  }
};

export const syncReactions = async () => {
  const latestReactionTimestamp = (
    await prisma.reaction.aggregate({
      _max: {
        timestamp: true,
      },
    })
  )._max.timestamp;

  console.log('latestReactionTimestamp', latestReactionTimestamp);

  const castIds = (
    await prisma.packagedCast.findMany({
      select: {
        id: true,
      },
    })
  ).map((cast) => cast.id);

  const newReactions = await getNewReactions(latestReactionTimestamp || FROM_DATE);

  const data = newReactions
    .map((reaction) => ({
      fid: reaction.fid,
      castId: `0x${reaction.target_hash.toString('hex')}`,
      timestamp: reaction.timestamp,
      reactionType: reaction.reaction_type,
    }))
    .filter((reaction) => castIds.includes(reaction.castId));

  console.log(`Indexing ${data.length} new reactions`);
  await prisma.reaction.createMany({
    data,
    skipDuplicates: true,
  });
};

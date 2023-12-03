import prisma from './prisma';
import { getCasts, getNewCasts, getNewReactions } from './providers/farcaster';
import { binarySearch } from './utils';

const FROM_DATE = new Date('2023-11-15T00:00:00.000Z');

const getLastIndexedAt = async (): Promise<Date | null> => {
  const lastIndexedAt = (
    await prisma.packagedCast.aggregate({
      _max: {
        timestamp: true,
      },
    })
  )._max.timestamp;

  return lastIndexedAt;
};

// Index all casts from a specified date
export const indexCasts = async () => {
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

    const casts = await await getCasts({ fromDate: FROM_DATE });

    await prisma.packagedCast.createMany({
      data: casts
        .filter((cast) => binarySearch(fids, cast.fid) !== -1)
        .map((cast) => {
          const hashHex = `0x${cast.hash.toString('hex')}`;
          return {
            fid: cast.fid,
            id: hashHex,
            text: cast.text,
            timestamp: cast.timestamp,
            embeds: cast.embeds.map((embed) => embed.url),
            mentions: cast.mentions,
            mentionsPositions: cast.mentions_positions,
            parentUrl: cast.parent_url,
            hash: hashHex,
            likesCount: cast.likes_count,
            recastsCount: cast.recasts_count,
          };
        }),
      skipDuplicates: true,
    });
  } else {
    const latestCastTimestamp = (
      await prisma.packagedCast.aggregate({
        _max: {
          timestamp: true,
        },
      })
    )._max.timestamp;

    console.log('latestCastTimestamp', latestCastTimestamp);
    const casts = await getNewCasts(latestCastTimestamp || FROM_DATE);

    console.log(`Indexing ${casts.length} new casts`);

    await prisma.packagedCast.createMany({
      data: casts
        .filter((cast) => binarySearch(fids, cast.fid) !== -1)
        .map((cast) => {
          const hashHex = `0x${cast.hash.toString('hex')}`;
          return {
            fid: cast.fid,
            id: hashHex,
            text: cast.text,
            timestamp: cast.timestamp,
            embeds: cast.embeds.map((embed) => embed.url),
            mentions: cast.mentions,
            mentionsPositions: cast.mentions_positions,
            parentUrl: cast.parent_url,
            hash: hashHex,
            likesCount: 0,
            recastsCount: 0,
          };
        }),
      skipDuplicates: true,
    });
  }
};

export const indexReactions = async () => {
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

  console.time('Get new reactions');
  const newReactions = await getNewReactions(latestReactionTimestamp || FROM_DATE);
  console.timeEnd('Get new reactions');

  console.time('Filtering');
  const data = newReactions
    .map((reaction) => ({
      fid: reaction.fid,
      castId: `0x${reaction.target_hash.toString('hex')}`,
      timestamp: reaction.timestamp,
      reactionType: reaction.reaction_type,
    }))
    .filter((reaction) => castIds.includes(reaction.castId));
  console.timeEnd('Filtering');

  console.log(`Indexing ${data.length} new reactions`);
  await prisma.reaction.createMany({
    data,
    skipDuplicates: true,
  });
};

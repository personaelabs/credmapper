import prisma from './prisma';
import { getCasts } from './providers/farcaster';
import { batchRun } from './utils';
import { IndexedCast } from './types';

// Index all casts from a specified date
export const indexCasts = async () => {
  const fromDate = new Date('2023-11-15T00:00:00.000Z');

  const casts = await getCasts({
    fromDate,
  });

  await batchRun(
    async (casts) => {
      const parsedCasts = (
        await Promise.all(
          casts.map(async (cast) => {
            try {
              return {
                fid: cast.fid,
                text: cast.text,
                timestamp: cast.timestamp,
                hash: `0x${cast.hash.toString('hex')}`,
                embeds: cast.embeds.map((embed) => embed.url),
                mentions: cast.mentions,
                mentionsPositions: cast.mentions_positions,
                parentUrl: cast.parent_url,
                likesCount: cast.likes_count,
                recastsCount: cast.recasts_count,
              } as IndexedCast;
            } catch (e) {
              console.log(e);
              return null;
            }
          }),
        )
      ).filter((cast) => cast) as IndexedCast[];

      for (const cast of parsedCasts) {
        const data = {
          id: cast.hash,
          text: cast.text,
          timestamp: cast.timestamp,
          embeds: cast.embeds,
          mentions: cast.mentions,
          mentionsPositions: cast.mentionsPositions,
          parentUrl: cast.parentUrl,
          hash: cast.hash,
          likesCount: cast.likesCount,
          recastsCount: cast.recastsCount,
        };

        try {
          await prisma.packagedCast.upsert({
            create: {
              ...data,
              user: {
                connect: {
                  fid: Number(cast.fid),
                },
              },
            },
            update: data,
            where: {
              id: cast.hash,
            },
          });
        } catch (err) {
          console.log(err);
        }
      }
    },
    casts,
    'Index casts',
    20,
  );
};

import prisma from '@/src/prisma';
import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getCasts } from '@/src/lib/farcaster';
import { binarySearch } from '@/src/lib/utils';

export const fcReplicaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.FARCASTER_REPLICA_DB_URL,
    },
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const latestSyncedCast = await prisma.packagedCast.findFirst({
    orderBy: {
      timestamp: 'desc',
    },
  });

  console.log(`Latest synced cast: ${latestSyncedCast?.timestamp}`);

  const casts = await getCasts(latestSyncedCast?.timestamp || new Date('2023-11-01T00:00:00.000Z'));

  if (!latestSyncedCast) {
    const allFids = (
      await prisma.user.findMany({
        select: {
          fid: true,
        },
        orderBy: {
          fid: 'asc',
        },
      })
    ).map((user) => Number(user.fid));

    const filteredCasts = casts.filter((cast) => {
      const index = binarySearch(allFids, Number(cast.fid));
      return index !== -1;
    });

    await prisma.packagedCast.createMany({
      data: filteredCasts,
    });
  } else {
    console.log(`Upserting ${casts.length} casts`);

    for (const cast of casts) {
      try {
        await prisma.packagedCast.upsert({
          create: {
            ...cast,
            fid: undefined,
            user: {
              connect: {
                fid: cast.fid,
              },
            },
          },
          update: cast,
          where: {
            id: cast.hash,
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  res.send('ok');
}

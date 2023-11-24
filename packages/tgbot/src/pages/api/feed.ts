import prisma from '@/src/prisma';
import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import channels from '@/channels.json';
import { GetFeedQueryParams } from '@/src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query as unknown as GetFeedQueryParams;

  const channelId = query.channelId;
  const parentHash = channels.find((c) => c.channel_id === channelId)?.parent_url;
  const cred = query.cred;
  console.log({ channelId, parentHash });
  const offset = parseInt((query.offset || '0') as string);
  console.log({ offset });

  const casts = await prisma.packagedCast.findMany({
    select: {
      text: true,
      timestamp: true,
      parentHash: true,
      embeds: true,
      mentions: true,
      mentionsPositions: true,
      user: {
        select: {
          displayName: true,
          cred: true,
          username: true,
        },
      },
    },
    where: {
      user: cred
        ? {
            cred: {
              has: cred,
            },
          }
        : {},
      parentHash,
    },
    skip: offset as number,
    take: 11,
    orderBy: {
      timestamp: 'desc',
    },
  });

  const feed = casts.slice(0, 10).map((cast) => ({
    username: cast.user.username,
    text: cast.text,
    timestamp: cast.timestamp,
    cred: 'over_100txs',
    channel: channels.find((c) => c.parent_url === cast.parentHash)?.name || 'Home',
  }));

  const hasMore = casts.length > 10;

  res.status(200).json({ feed, hasMore });
}

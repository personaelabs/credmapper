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
  const parentUrl = channels.find((c) => c.channel_id === channelId)?.parent_url;
  const cred = query.cred;
  const offset = parseInt((query.offset || '0') as string);
  console.log(channelId, cred);

  const casts = await prisma.packagedCast.findMany({
    select: {
      text: true,
      timestamp: true,
      parentUrl: true,
      embeds: true,
      mentions: true,
      mentionsPositions: true,
      likesCount: true,
      recastsCount: true,
      repliesCount: true,
      user: {
        select: {
          displayName: true,
          username: true,
          pfp: true,
          UserCred: {
            select: {
              cred: true,
            },
          },
        },
      },
    },
    where: {
      user: cred
        ? {
            UserCred: {
              some: {
                cred,
              },
            },
          }
        : {},
      parentUrl,
    },
    skip: offset as number,
    take: 11,
    orderBy: {
      score: 'desc',
    },
  });

  const feed = casts.slice(0, 10).map((cast) => ({
    ...cast,
    mentions: cast.mentions.map((mention) => mention.toString()),
    likesCount: Number(cast.likesCount),
    recastsCount: Number(cast.recastsCount),
    repliesCount: Number(cast.repliesCount),
    channel: channels.find((c) => c.parent_url === cast.parentUrl),
  }));

  const hasNextPage = casts.length > 10;
  console.log(hasNextPage);

  res.status(200).json({ feed, hasNextPage });
}

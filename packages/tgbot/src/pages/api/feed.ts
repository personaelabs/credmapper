import prisma from '@/src/prisma';
import { Venue } from '@prisma/client';
import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import channels from '@/channels.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const channelId = req.query.channelId;
  const offset = parseInt((req.query.offset || '0') as string);

  let where: {
    venue: Venue;
    cred: string;
    parentHash?: string;
  } = {
    venue: Venue.Farcaster,
    cred: 'over_100txs',
  };

  if (channelId) {
    where.parentHash = channels.find((c) => c.channel_id === channelId)!.parent_url;
  }

  const casts = await prisma.packagedCast.findMany({
    select: {
      username: true,
      displayName: true,
      text: true,
      timestamp: true,
      cred: true,
      embeds: true,
      mentionPositions: true,
      mentions: true,
      parentHash: true,
    },
    where,
    skip: offset as number,
    take: 11,
    orderBy: {
      timestamp: 'desc',
    },
  });

  const feed = casts.slice(10).map((cast) => ({
    username: cast.username,
    text: cast.text,
    timestamp: cast.timestamp,
    cred: 'over_100txs',
    channel: channels.find((c) => c.parent_url === cast.parentHash)?.name || 'Home',
  }));

  const hasMore = casts.length > 10;

  res.status(200).json({ feed, hasMore });
}

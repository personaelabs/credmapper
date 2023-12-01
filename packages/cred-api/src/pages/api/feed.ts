import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetFeedQueryParams, FeedQueryResult } from '@/src/types';
import { getChannelFeed, getCredFeed } from '@/src/lib/feed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query as unknown as GetFeedQueryParams;
  const offset = Number(query.offset || 0);

  const channelId = query.channelId;

  if (query.cred) {
    const { feed, hasNextPage } = await getCredFeed(offset);
    res.status(200).json({ feed, hasNextPage });
  } else if (query.channelId) {
    const { feed, hasNextPage } = await getChannelFeed(channelId, offset);
    res.status(200).json({ feed, hasNextPage });
  } else {
    res.status(400).json({ error: 'Invalid query' });
  }
}

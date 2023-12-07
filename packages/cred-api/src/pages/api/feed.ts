import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetFeedQueryParams, FeedQueryResult, Feed } from '@/src/types';
import { getSpotlightFeed } from '@/src/lib/feed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query as unknown as GetFeedQueryParams;
  const offset = Number(query.offset || 0);

  const feed = Number(query.feed);

  if (feed === Feed.Spotlight) {
    const { feed, hasNextPage } = await getSpotlightFeed(offset);
    res.status(200).json({ feed, hasNextPage });
  } else if (feed === Feed.Following) {
    const { feed, hasNextPage } = await getSpotlightFeed(offset);
    res.status(200).json({ feed, hasNextPage });
  } else {
    res.status(400).json({ error: 'Invalid query' });
  }
}

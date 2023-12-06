import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetUserFeedQueryParams } from '@/src/types';
import { getUserFeed } from '@/src/lib/feed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query as unknown as GetUserFeedQueryParams;
  const offset = Number(query.offset || 0);

  const fid = BigInt(query.fid);

  if (fid) {
    const { feed, hasNextPage } = await getUserFeed(fid, offset);
    res.status(200).json({ feed, hasNextPage });
  } else {
    res.status(400).json({ error: 'Invalid query' });
  }
}

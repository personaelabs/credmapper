import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/prisma';
import { CastWithChildrenSelect, castToFeedItem, CastSelect } from '@/src/lib/feed';

// Define a custom serialization method for BigInt
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Get a cast and its children (doesn't include descendants yet)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const castId = req.query.castId as string;

  const cast = await prisma.packagedCast.findFirst({
    select: CastWithChildrenSelect,
    where: {
      id: castId,
    },
  });

  if (!cast) {
    return res.status(404).json({ error: 'Cast not found' });
  }

  const castAsFeedItem = castToFeedItem(cast);

  const children = await prisma.packagedCast.findMany({
    select: CastSelect,
    where: {
      parentHash: castId,
    },
  });

  const childrenAsFeedItems = children.map(castToFeedItem);

  return res.status(200).json({ cast: castAsFeedItem, children: childrenAsFeedItems });
}

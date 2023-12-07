import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/prisma';
import { CastWithChildrenSelect, castToFeedItem, CastSelect } from '@/src/lib/feed';
import { MentionedUser } from '@/src/types';

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

  const mentionedFids = new Set<bigint>();

  for (const mention of cast.mentions) {
    mentionedFids.add(mention);
  }
  for (const child of cast.children) {
    for (const mention of child.mentions) {
      mentionedFids.add(mention);
    }
  }

  const mentionedUsers = (
    await prisma.user.findMany({
      select: {
        fid: true,
        username: true,
      },
      where: {
        fid: {
          in: [...mentionedFids],
        },
      },
    })
  ).filter((user) => user.username !== null) as MentionedUser[];

  const castAsFeedItem = castToFeedItem(cast, mentionedUsers);

  const childrenAsFeedItems = cast.children
    .map((child) => castToFeedItem(child, mentionedUsers))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return res.status(200).json({ cast: castAsFeedItem, children: childrenAsFeedItems });
}

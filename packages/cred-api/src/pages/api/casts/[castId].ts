import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/prisma';
import { castToFeedItem, CastSelect } from '@/src/lib/feed';
import { Prisma } from '@prisma/client';
import { getMentionedUsersInCasts } from '@/src/lib/utils';

// Define a custom serialization method for BigInt
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const CastWithChildrenSelect = {
  ...CastSelect,
  children: {
    select: {
      ...CastSelect,
      children: false,
    },
  },
};

export type CastWithChildrenSelectResult = Prisma.PackagedCastGetPayload<{
  select: typeof CastWithChildrenSelect;
}>;

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

  const mentionedUsers = await getMentionedUsersInCasts([cast, ...cast.children]);
  const castAsFeedItem = castToFeedItem(cast, mentionedUsers);

  const childrenAsFeedItems = cast.children
    .map((child) => castToFeedItem(child, mentionedUsers))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return res.status(200).json({ cast: castAsFeedItem, children: childrenAsFeedItems });
}

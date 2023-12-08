import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetCredFeedQueryParams, GetCredUsersQueryParams } from '@/src/types';
import prisma from '@/src/prisma';
import { CastSelect, castToFeedItem } from '@/src/lib/feed';
import { getMentionedUsersInCasts } from '@/src/lib/utils';

// A custom serialization method for BigInt
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const PAGE_SIZE = 20;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query as unknown as GetCredFeedQueryParams;
  const cred = query.cred;
  const offset = Number(query.offset || 0);

  const casts = await prisma.packagedCast.findMany({
    select: CastSelect,
    where: {
      parentHash: null,
      user: {
        UserCred: {
          some: {
            cred: {
              equals: cred,
            },
          },
        },
      },
    },
    skip: offset,
    take: PAGE_SIZE + 1,
    orderBy: {
      timestamp: 'desc',
    },
  });

  const hasNextPage = casts.length > PAGE_SIZE;

  const mentionedUsers = await getMentionedUsersInCasts(casts);

  const feed = casts.map((cast) => {
    return castToFeedItem(cast, mentionedUsers);
  });

  res.status(200).json({ feed, hasNextPage });
}

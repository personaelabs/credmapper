import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/src/lib/neynar';
import prisma from '@/src/prisma';
import CRED_META from '@/credMeta';
import { CastSelect, castToFeedItem } from '@/src/lib/feed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fid = BigInt(req.query.fid as string);

  const user = await prisma.user.findUnique({
    select: {
      fid: true,
      displayName: true,
      username: true,
      pfp: true,
      bio: true,
      UserCred: {
        select: {
          cred: true,
        },
      },
      addresses: {
        select: {
          address: true,
        },
      },
      PackagedCast: {
        select: CastSelect,
      },
    },
    where: {
      fid,
    },
  });

  const cred = user?.UserCred.map((cred) => CRED_META.find((meta) => meta.id === cred.cred)).filter(
    (cred) => cred,
  );

  const addresses = user?.addresses.map((address) => address.address);

  const casts = user?.PackagedCast.map(castToFeedItem);

  const {
    result: {
      user: { followerCount, followingCount },
    },
  } = await getUser(fid.toString());

  return res.status(200).json({ ...user, casts, followerCount, followingCount, cred, addresses });
}

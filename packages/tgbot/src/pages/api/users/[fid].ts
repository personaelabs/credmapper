import prisma from '@/src/prisma';
import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetAccountQueryParams } from '@/src/types';
import { getUserAddresses } from '@/src/lib/farcaster';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fid: fidString } = req.query as unknown as GetAccountQueryParams;
  const fid = parseInt(fidString);

  const user = await prisma.user.findFirst({
    select: {
      pfp: true,
      username: true,
      displayName: true,
      UserCred: {
        select: {
          cred: true,
        },
      },
    },
    where: {
      fid,
    },
  });

  const addresses = await getUserAddresses(fid);

  res.status(200).json({ ...user, addresses });
}

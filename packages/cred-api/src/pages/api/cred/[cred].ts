import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { GetCredUsersQueryParams } from '@/src/types';
import prisma from '@/src/prisma';
import CRED_META from '@/credMeta';

// A custom serialization method for BigInt
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query as unknown as GetCredUsersQueryParams;
  const cred = query.cred;

  const credMetadata = CRED_META.find((credMeta) => credMeta.id === cred);

  const result = await prisma.userCred.findMany({
    select: {
      fid: true,
    },
    where: {
      cred: cred,
    },
  });

  const fids = result.map((userCred) => userCred.fid);

  const users = await prisma.user.findMany({
    select: {
      fid: true,
      username: true,
      displayName: true,
      pfp: true,
      bio: true,
    },
    where: {
      fid: {
        in: fids,
      },
    },
  });

  res.status(200).json({ users, metadata: credMetadata });
}

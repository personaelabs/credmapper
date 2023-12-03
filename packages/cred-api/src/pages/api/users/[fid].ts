import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/src/lib/neynar';
import prisma from '@/src/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUser(req.query.fid as string);
  const userCred = await prisma.userCred.findMany({
    where: {
      fid: Number(req.query.fid as string),
    },
  });

  return res.status(200).json({ ...user, userCred });
}

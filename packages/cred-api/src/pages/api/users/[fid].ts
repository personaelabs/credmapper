import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/src/lib/neynar';
import prisma from '@/src/prisma';
import CRED_META from '@/credMeta';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUser(req.query.fid as string);
  const cred = (
    await prisma.userCred.findMany({
      select: {
        cred: true,
      },
      where: {
        fid: Number(req.query.fid as string),
      },
    })
  )
    .map((cred) => CRED_META.find((meta) => meta.id === cred.cred))
    .filter((cred) => cred);

  return res.status(200).json({ ...user.result.user, cred });
}

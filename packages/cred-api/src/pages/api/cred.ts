import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/prisma';
import CRED_META from '@/credMeta';

// Return a list of all cred
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = (
    await prisma.userCred.findMany({
      select: {
        cred: true,
      },
      distinct: ['cred'],
    })
  ).map((userCred) => userCred.cred);

  const cred = result
    .map((cred) => CRED_META.find((credMeta) => credMeta.id === cred))
    .filter((cred) => cred);

  res.status(200).json({ cred });
}

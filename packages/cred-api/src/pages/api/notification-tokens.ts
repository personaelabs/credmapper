import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.body.token;

  if (token) {
    const data = {
      token,
    };
    await prisma.notificationToken.upsert({
      create: data,
      update: data,
      where: {
        token,
      },
    });
    res.status(200).send('ok');
  } else {
    res.status(400).json({ error: 'Invalid body' });
  }
}

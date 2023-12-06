import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/src/lib/neynar';
import prisma from '@/src/prisma';
import CRED_META from '@/credMeta';

const handleFollow = async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO
};

const handleGetFollows = async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return handleFollow(req, res);
  } else if (req.method === 'GET') {
    return handleGetFollows(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

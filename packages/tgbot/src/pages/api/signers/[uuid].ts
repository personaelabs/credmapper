import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSigner } from '@/src/lib/neynar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const signerUuid = req.query.uuid as string;
  const signer = await getSigner(signerUuid);

  return res.status(200).json(signer);
}

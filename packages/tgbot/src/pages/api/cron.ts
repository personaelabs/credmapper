import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendDailyCasts } from '@/src/cron';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await sendDailyCasts();
  res.send('ok');
}

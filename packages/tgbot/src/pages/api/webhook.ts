import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import bot from '@/src/bot';
import { randomBytes } from 'crypto';
import { Update } from 'telegraf/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body as Update);
      res.send('ok');
    } else if (req.method === 'GET') {
      if (process.env.NODE_ENV === 'production') {
        await bot.launch({
          webhook: {
            domain: 'tg-bot-nu-seven.vercel.app',
            path: '/api/webhook',
            secretToken: randomBytes(64).toString('hex'),
          },
        });

        const webhookInfo = await bot.telegram.getWebhookInfo();
        res.status(200).json(webhookInfo);
      } else {
        bot.launch();
        console.log('Bot launched locally');
        res.status(200).send('ok');
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

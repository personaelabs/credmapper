import prisma from './prisma';
import { Context } from 'telegraf';

const logger = async (ctx: Context, next: () => Promise<void>) => {
  const chatId = ctx.chat?.id.toString();
  // @ts-ignore
  const message: string | undefined = ctx.message.text;

  if (chatId && message) {
    await prisma.messageLog.create({
      data: {
        chatId,
        message,
      },
    });
  }

  await next();
};

export default logger;

import { Context } from 'telegraf';
import prisma from '../../prisma';

export const handleSetUpdatesConfig = async (ctx: Context, enabled: boolean) => {
  const chatId = ctx.chat?.id.toString();

  await prisma.tGChat.update({
    data: {
      dailyUpdatesEnabled: enabled,
    },
    where: {
      chatId,
    },
  });
};

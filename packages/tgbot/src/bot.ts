import 'dotenv/config';
import { Telegraf, session } from 'telegraf';
import prisma from './prisma';
import { sendPackagedCasts } from './cron';

const bot = new Telegraf(process.env.BOT_TOKEN || '');

bot.use(session());

bot.telegram.setMyCommands([
  {
    command: '/disableupdates',
    description: 'Disable daily updates',
  },
  {
    command: '/enabledaily',
    description: 'Enable daily updates',
  },
  {
    command: '/fetch',
    description: 'Fetch the latest updates from credible sources',
  },
]);

// Return bot name
bot.command('bot', async (ctx) => {
  ctx.reply(ctx.botInfo.first_name);
});

// On all incoming messages
bot.on('message', async (ctx, next) => {
  const chat = await prisma.tGChat.findFirst({
    where: {
      chatId: ctx.chat.id.toString(),
    },
  });

  // Add chatId to the database if it hasn't been added yet
  if (!chat) {
    await prisma.tGChat.create({
      data: {
        chatId: ctx.chat.id.toString(),
      },
    });
  }

  await next();
});

bot.command('disableupdates', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  await prisma.tGChat.update({
    data: {
      dailyUpdatesEnabled: false,
    },
    where: {
      chatId,
    },
  });
  await ctx.reply('Disabled daily updates');
});

bot.command('enabledaily', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  await prisma.tGChat.update({
    data: {
      dailyUpdatesEnabled: true,
    },
    where: {
      chatId,
    },
  });
  await ctx.reply('Enabled daily updates');
});

bot.command('fetch', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  await sendPackagedCasts([chatId]);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

if (process.env.NODE_ENV !== 'production') {
  bot.launch();
  console.log('Bot launched locally');
}

export default bot;

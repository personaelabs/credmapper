import 'dotenv/config';
import { Telegraf, session } from 'telegraf';
import prisma from './prisma';
import { Command, ContextWithSession } from './types';
import {
  handleChannelsAdd,
  handleChannelsRemove,
  handleGetChannels,
} from './bot/commands/channels';
import { handleSetUpdatesConfig } from './bot/commands/dailyUpdates';
import { command, commandsMeta } from './bot/commands/commands';
import logger from './logger';
import { sendUnreadCastsToChat } from './cron';

const bot = new Telegraf<ContextWithSession>(process.env.BOT_TOKEN || '');

bot.use(session());
bot.use(logger);

bot.telegram.setMyCommands(commandsMeta);

const setSessionCommand = async (ctx: ContextWithSession, command: Command) => {
  if (!ctx.session) {
    ctx.session = {};
  }

  ctx.session.command = command;
};

// Return bot name
bot.command('bot', async (ctx) => {
  ctx.reply(ctx.botInfo.first_name);
});

bot.command(command(Command.Start), async (ctx) => {
  // Set the session to selectChannels

  await ctx.reply('Welcome!');

  await setSessionCommand(ctx, Command.AddChannels);
  await ctx.reply(`Please enter names of the Farcaster channels to subscribe.`);
  await ctx.reply(`Enter "skip" to skip this step.`);
});

bot.command(command(Command.ListChannels), async (ctx) => {
  await handleGetChannels(ctx);
});

bot.command(command(Command.AddChannels), async (ctx) => {
  await setSessionCommand(ctx, Command.AddChannels);
  await ctx.reply(`Please enter names of the Farcaster channels to subscribe.`);
});

bot.command(command(Command.RemoveChannels), async (ctx) => {
  await setSessionCommand(ctx, Command.RemoveChannels);
  await ctx.reply(`Please enter names of the Farcaster channels to unsubscribe.`);
});

bot.command(command(Command.EnableUpdates), async (ctx) => {
  await handleSetUpdatesConfig(ctx, false);
  await ctx.reply('Enabled updates');
});

bot.command(command(Command.DisableUpdates), async (ctx) => {
  await handleSetUpdatesConfig(ctx, false);
  await ctx.reply('Disabled updates');
});

bot.command(command(Command.Fetch), async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const text = ctx.message.text;

  const options = text.split(' ');
  const channelId = options.length > 0 ? options[0] : undefined;
  const numCasts = options.length > 1 ? parseInt(options[1]) : 5;

  await sendUnreadCastsToChat(chatId, {
    numCasts,
    channelIds: channelId ? [channelId] : null,
    creds: null,
  });

  // Should we try to sending high-value creddd or not?
  // Just try curating all of that for now.

  // Send casts to the chat when it appears.
  // How often does it appear?
  // Not super often actually.

  // await sendUnreadCastsToChat(chatId, numCasts)
  await ctx.reply('use /fetch to fetch more');
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

  // Handle the message as command input
  // if this is a reply to a command message.
  const command = ctx.session?.command;
  if (command) {
    switch (command) {
      case Command.AddChannels:
        await handleChannelsAdd(ctx);
        break;
      case Command.RemoveChannels:
        await handleChannelsRemove(ctx);
        break;
    }

    // Reset the session
    ctx.session!.command = undefined;
  }

  await next();
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

if (process.env.NODE_ENV !== 'production') {
  bot.launch();
  console.log('Bot launched locally');
}

export default bot;

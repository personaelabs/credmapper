import { Command, MessageContext } from '../../types';
import channels from '../../../channels.json';
import prisma from '../../prisma';
import { command } from './commands';
import { formatListWithAnd, getSessionCommand } from '@/src/utils';

export const DEFAULT_CHANNEL_IDS = ['ethereum', 'farcaster', 'ai'];

export const DEFAULT_CHANNELS = channels.filter((c) => DEFAULT_CHANNEL_IDS.includes(c.channel_id));

export const handleChannelsAdd = async (ctx: MessageContext) => {
  const chatId = ctx.chat.id.toString();

  // @ts-ignore
  const text: string = ctx.message.text.toLowerCase().trim();

  let selectedChannels;
  const isSkipped = text === 'skip' || text === '/skip';
  if (isSkipped) {
    selectedChannels = DEFAULT_CHANNELS;
  } else {
    const selectedChannelNames = text.split(',').map((c) => c.trim().toLowerCase());

    // Find matching channels
    selectedChannels = channels.filter((c) => selectedChannelNames.includes(c.name.toLowerCase()));
  }

  // TODO: Return channels that were not found

  await prisma.tGChat.update({
    data: {
      channels: selectedChannels.map((c) => c.channel_id),
    },
    where: {
      chatId,
    },
  });

  if (isSkipped) {
    await ctx.reply(
      `Subscribed to the default channels ${formatListWithAnd(
        DEFAULT_CHANNELS.map((c) => c.name),
      )}`,
    );
  } else {
    await ctx.reply(`Subscribed to ${formatListWithAnd(selectedChannels.map((c) => c.name))}`);
  }
};

export const handleChannelsRemove = async (ctx: MessageContext) => {
  const chatId = ctx.chat.id.toString();

  // @ts-ignore
  const text: string = ctx.message.text.toLowerCase();

  const channelsNames = text.split(',').map((c) => c.trim().toLowerCase());

  const channelsToRemove = channels.filter((c) => channelsNames.includes(c.name.toLowerCase()));
  const channelIdsToRemove = channelsToRemove.map((c) => c.channel_id);

  const currentChannels = (await prisma.tGChat.findFirst({
    where: {
      chatId,
    },
    select: {
      channels: true,
    },
  }))!.channels;

  await prisma.tGChat.update({
    data: {
      channels: currentChannels.filter((c) => !channelIdsToRemove.includes(c)),
    },
    where: {
      chatId,
    },
  });

  await ctx.reply(`Unsubscribed from ${formatListWithAnd(channelsToRemove.map((c) => c.name))}`);
};

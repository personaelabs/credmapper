import { Command, MessageContext } from '../../types';
import channels from '../../../channels.json';
import prisma from '../../prisma';
import { command } from './commands';
import { formatListWithAnd, getSessionCommand, pluralize } from '@/src/utils';

export const DEFAULT_CHANNEL_IDS = ['ethereum', 'farcaster', 'ai'];

export const DEFAULT_CHANNELS = channels.filter((c) => DEFAULT_CHANNEL_IDS.includes(c.channel_id));

export const handleChannelsAdd = async (ctx: MessageContext) => {
  const chatId = ctx.chat.id.toString();

  // @ts-ignore
  const text: string = ctx.message.text.toLowerCase().trim();

  let selectedChannels: any[];
  const isSkipped = text === 'skip' || text === '/skip';
  if (isSkipped) {
    selectedChannels = DEFAULT_CHANNELS;
  } else {
    // Find matching channels

    const selectedChannelNames = text.split(',').map((c) => c.trim().toLowerCase());
    selectedChannels = channels.filter((c) => selectedChannelNames.includes(c.name.toLowerCase()));

    const channelsNotFound = selectedChannelNames.filter(
      (c) => !channels.some((channel) => channel.name.toLowerCase() === c),
    );

    if (channelsNotFound.length > 0) {
      await ctx.reply(
        `Could not find ${pluralize('channel', channelsNotFound)} ${formatListWithAnd(
          channelsNotFound,
        )}.`,
      );
    }
  }

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
      channels: [...new Set([...currentChannels, ...selectedChannels.map((c) => c.channel_id)])],
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
    if (selectedChannels.length > 0) {
      await ctx.reply(`Subscribed to ${formatListWithAnd(selectedChannels.map((c) => c.name))}`);
    }
  }
};

export const handleChannelsRemove = async (ctx: MessageContext) => {
  const chatId = ctx.chat.id.toString();

  // @ts-ignore
  const text: string = ctx.message.text.toLowerCase();

  const channelsNames = text.split(',').map((c) => c.trim().toLowerCase());

  const channelsToRemove = channels.filter((c) => channelsNames.includes(c.name.toLowerCase()));
  const channelIdsToRemove = channelsToRemove.map((c) => c.channel_id);

  const channelsNotFound = channelsNames.filter(
    (c) => !channels.some((channel) => channel.name.toLowerCase() === c),
  );

  if (channelsNotFound.length > 0) {
    await ctx.reply(
      `Could not find ${pluralize('channel', channelsNotFound)} ${formatListWithAnd(
        channelsNotFound,
      )}.`,
    );
  }

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

  if (channelsToRemove.length > 0) {
    await ctx.reply(`Unsubscribed from ${formatListWithAnd(channelsToRemove.map((c) => c.name))}`);
  }
};

export const handleGetChannels = async (ctx: MessageContext) => {
  const chatId = ctx.chat.id.toString();

  const channelIds = (await prisma.tGChat.findFirst({
    where: {
      chatId,
    },
    select: {
      channels: true,
    },
  }))!.channels;

  const channelNames = channelIds.map((id) => channels.find((c) => c.channel_id === id)!.name);

  if (channels.length === 0) {
    await ctx.reply('You are not subscribed to any channels');
  } else {
    await ctx.reply(`You are subscribed to ${formatListWithAnd(channelNames)}`);
  }
};

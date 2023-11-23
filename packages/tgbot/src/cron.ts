import bot from './bot';
import prisma from './prisma';
import { Cred, PackagedCast, Venue } from '@prisma/client';
import { Input } from 'telegraf';
import channels from '../channels.json';
import { CastsFilterOptions } from './types';

// Send image with a caption of the cast url and caster address
const sendWithCaption = async (chatId: string, image: Buffer, cast: PackagedCast) => {
  const warpcastUrl = `https://warpcast.com/${cast.username}/${cast.hash}`;
  const etherscanUrl = `https://etherscan.io/address/${cast.address}`;

  const channelName = channels.find((channel) => channel.parent_url === cast.parentUrl)!.name;

  const caption = `[in ${channelName}](${warpcastUrl}) \n[Caster](${etherscanUrl}) has \\> 100 txs on ETH mainnet\n`;
  await bot.telegram.sendPhoto(chatId, Input.fromBuffer(image), {
    parse_mode: 'MarkdownV2',
    caption,
    caption_entities: [
      {
        type: 'url',
        offset: `[in `.length,
        length: channelName.length,
      },
      {
        type: 'url',
        offset: `[in ${channelName}](`.length,
        length: warpcastUrl.length,
      },
      {
        type: 'url',
        offset: caption.indexOf('r](') + 3,
        length: etherscanUrl.length,
      },
    ],
  });
};

// Send casts to a chat
export const sendUnreadCastsToChat = async (chatId: string, options: CastsFilterOptions) => {
  const channelUrls = options.channelIds
    ? channels
        .filter((channel) => options.channelIds!.includes(channel.channel_id))
        .map((channel) => channel.parent_url)
    : [];

  // Get all casts that haven't been sent to `chatId`
  const unsentPackagedCast = await prisma.packagedCast.findMany({
    include: { PackagedCastSent: true },
    where: {
      cred: {
        in: options.creds ? options.creds : [],
      },
      parentUrl: {
        in: channelUrls,
      },
      venue: Venue.Farcaster,
      PackagedCastSent: {
        none: {
          chatId,
        },
      },
    },
    take: options.numCasts || 5,
  });

  console.log(`Sending ${unsentPackagedCast.length} casts to ${chatId}`);

  if (unsentPackagedCast.length === 0) {
    await bot.telegram.sendMessage(chatId, `You're up to date.`);
    return;
  }

  const castsWithoutAttachments = unsentPackagedCast.filter((cast) => cast.images.length === 0);
  const castsWithAttachments = unsentPackagedCast.filter((cast) => cast.images.length > 0);

  // We send out casts without attachments asynchronously first
  // to lower the perceived latency
  await Promise.all(
    castsWithoutAttachments.map(async (cast) => {
      try {
        await sendWithCaption(chatId, cast.ogpImage, cast);
      } catch (err) {
        console.log(err);
      }
    }),
  );

  for (const cast of castsWithAttachments) {
    const images = [cast.ogpImage, ...cast.images];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        // Get image as buffer
        const isLastImage = i === images.length - 1;
        if (isLastImage) {
          await sendWithCaption(chatId, images[i], cast);
        } else {
          await bot.telegram.sendPhoto(chatId, Input.fromBuffer(image));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  await prisma.packagedCastSent.createMany({
    data: unsentPackagedCast.map((packagedCast) => ({
      chatId,
      packagedCastId: packagedCast.id,
    })),
    skipDuplicates: true,
  });
};

// Send casts to all subscribed chats
export const sendUpdatesToAllChats = async () => {
  // Get all chats
  const chatIds = (
    await prisma.tGChat.findMany({
      select: {
        chatId: true,
      },
      where: {
        dailyUpdatesEnabled: true,
      },
    })
  ).map((chat) => chat.chatId);

  for (const chatId of chatIds) {
    // Get the channels that the chat is subscribed to
    const channelIds = (await prisma.tGChat.findFirst({
      where: {
        chatId,
      },
      select: {
        channels: true,
      },
    }))!.channels;

    await sendUnreadCastsToChat(chatId, {
      channelIds,
      creds: [Cred.Over100Txs],
      numCasts: 5,
    });
  }
};

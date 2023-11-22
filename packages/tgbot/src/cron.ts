import bot from './bot';
import prisma from './prisma';
import { Cred, PackagedCast, Venue } from '@prisma/client';
import { Input } from 'telegraf';
import channels from '../channels.json';

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

// Send casts to chats
export const sendPackagedCasts = async (chatIds: string[], channelUrl?: string) => {
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

    const channelUrls = channels
      .filter((channel) => channelIds.includes(channel.channel_id))
      .map((channel) => channel.parent_url);

    // Get all casts that haven't been sent to `chatId`
    const unsentPackagedCast = await prisma.packagedCast.findMany({
      include: { PackagedCastSent: true },
      where: {
        cred: Cred.Over100Txs,
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
    });

    console.log(`Sending ${unsentPackagedCast.length} casts to ${chatId}`);

    if (unsentPackagedCast.length === 0) {
      await bot.telegram.sendMessage(chatId, `You're up to date.`);
      continue;
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
  }
};

// Send daily casts to all subscribed chats
export const sendDailyCasts = async () => {
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

  await sendPackagedCasts(chatIds);
};

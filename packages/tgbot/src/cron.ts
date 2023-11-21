import axios from 'axios';
import bot from './bot';
import prisma from './prisma';
import { Cred, PackagedCred, Venue } from '@prisma/client';
import { ParsedCast, ParsedLensPost } from './types';
import { Input } from 'telegraf';

const getUnsentPackagedCred = async (
  venue: Venue,
  cred: Cred,
  chatId: string,
): Promise<PackagedCred[]> => {
  return await prisma.packagedCred.findMany({
    include: { PackagedCredSent: true },
    where: {
      cred,
      venue,
      PackagedCredSent: {
        none: {
          chatId,
        },
      },
    },
  });
};

export const sendPackagedLensPosts = async (chatIds: string[]) => {
  for (const chatId of chatIds) {
    // Get all casts that haven't been sent to `chatId`
    const unsentPackagedPosts = await getUnsentPackagedCred(Venue.Lens, Cred.Over100Txs, chatId);

    if (unsentPackagedPosts.length === 0) {
      await bot.telegram.sendMessage(chatId, `You're up to date.`);
      continue;
    }

    for (const packagedPost of unsentPackagedPosts) {
      const post = JSON.parse(packagedPost.data?.toString() as string) as ParsedLensPost;
      await bot.telegram.sendMessage(chatId, post.publicationUrl);
    }
  }
};

// Send casts to chats
export const sendPackagedCasts = async (chatIds: string[]) => {
  for (const chatId of chatIds) {
    console.time('get unsent casts');

    // Get all casts that haven't been sent to `chatId`
    const unsentPackagedCast = await getUnsentPackagedCred(
      Venue.Farcaster,
      Cred.Over100Txs,
      chatId,
    );
    console.timeEnd('get unsent casts');

    if (unsentPackagedCast.length === 0) {
      await bot.telegram.sendMessage(chatId, `You're up to date.`);
      continue;
    }

    // TODO: Send out casts without attachments asynchronously first
    // to lower the perceived latency

    for (const packagedCast of unsentPackagedCast) {
      const cast = JSON.parse(packagedCast.data?.toString() as string) as ParsedCast;
      const images = [cast.ogpImage, ...cast.images];
      const warpcastUrl = `https://warpcast.com/${cast.username}/${cast.hash}`;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
          // Get image as buffer
          const { data } = await axios.get(image, {
            responseType: 'arraybuffer',
          });

          const isLastImage = i === images.length - 1;
          if (isLastImage) {
            const etherscanUrl = `https://etherscan.io/address/${cast.address}`;
            await bot.telegram.sendPhoto(chatId, Input.fromBuffer(data), {
              caption: warpcastUrl,
            });
            await bot.telegram.sendMessage(
              chatId,
              `\\([Caster](${etherscanUrl}) has \\> 100 txs on ETH mainnet\\\)`,
              {
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: true,
              },
            );
          } else {
            await bot.telegram.sendPhoto(chatId, Input.fromBuffer(data));
          }
        } catch (err) {
          console.log(err);
        }
      }
    }

    console.time('save sent casts');
    await prisma.packagedCredSent.createMany({
      data: unsentPackagedCast.map((packagedCast) => ({
        chatId,
        packagedCredId: packagedCast.id,
      })),
    });
    console.timeEnd('save sent casts');
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

  await sendPackagedLensPosts(chatIds);
  await sendPackagedCasts(chatIds);
};

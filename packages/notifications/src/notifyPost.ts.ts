import 'dotenv/config';
import prisma from './prisma';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

const isDevToken = (token: string): boolean => {
  if (!process.env.DEV_NOTIFICATION_TOKENS) {
    throw new Error('DEV_NOTIFICATION_TOKENS not set');
  }

  return process.env.DEV_NOTIFICATION_TOKENS.includes(token);
};

const sendPostNotifications = async (castId: string, cred: string) => {
  const existingTickets = await prisma.notificationTicket.findMany({
    select: {
      id: true,
      token: true,
    },
  });

  const notificationTokens = await prisma.notificationToken.findMany({
    select: {
      token: true,
    },
  });

  const messages = [];
  for (const { token } of notificationTokens) {
    if (existingTickets.find((t) => t.token === token)) {
      // Throw an error even if there is a single duplicate
      throw new Error('Already sent');
    }

    if (process.env.NODE_ENV !== 'production' && !isDevToken(token)) {
      throw new Error('Not a dev token');
    }

    const message = {
      to: token,
      sound: 'default',
      body: `Featured cred: New post from "${cred}"`,
      data: { url: `/cast/${castId}` },
    };

    messages.push(message as ExpoPushMessage);
  }

  // TODO: Use chunks when we have many tokens
  // const chunks = await expo.chunkPushNotifications(messages);

  const tickets = [];
  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(messages);
    // @ts-ignore
    tickets.push(...ticketChunk.map((t) => ({ id: t.id, token: '' })));
  } catch (error) {
    console.error(error);
  }

  await prisma.notificationTicket.createMany({
    data: tickets,
    skipDuplicates: true,
  });
};

// https://warpcast.com/chrismartz/0x18d38160d7bb980e4c2b41170087fba88fb982bf
sendPostNotifications('0x0000767754a44bf5631903a860a46db8407f9ce4', 'Over 10,000 Txs');

// https://warpcast.com/danfinlay/0xba7aaf91dd27a7b5ccd57420639b7912333b5b67
// sendPostNotifications('0xba7aaf91dd27a7b5ccd57420639b7912333b5b67', 'Onchain since 2016');

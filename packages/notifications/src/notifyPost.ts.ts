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
  const notificationTokens = await prisma.notificationToken.findMany({
    select: {
      token: true,
    },
  });

  const cast = await prisma.packagedCast.findUnique({
    select: {
      text: true,
    },
    where: {
      id: castId,
    },
  });

  if (!cast) {
    throw new Error('Cast not found');
  }

  const messages = [];
  for (const { token } of notificationTokens) {
    if (process.env.NODE_ENV !== 'production' && !isDevToken(token)) {
      throw new Error('Not a dev token');
    }

    const message = {
      to: token,
      sound: 'default',
      title: `Featured cred: ${cred}`,
      body: `${cast.text}`,
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

  /*
  await prisma.notificationTicket.createMany({
    data: tickets,
    skipDuplicates: true,
  });
  */
};

// https://warpcast.com/danfinlay/0xba7aaf91dd27a7b5ccd57420639b7912333b5b67
// sendPostNotifications('0xba7aaf91dd27a7b5ccd57420639b7912333b5b67', 'Onchain since 2016');

// https://warpcast.com/danfinlay/0x8566660f7a9bd6eda256e6ec693936ced670f56e
// sendPostNotifications('0x8566660f7a9bd6eda256e6ec693936ced670f56e', 'Onchain since 2016');

// https://warpcast.com/boris/0x44a8a6bd7f84d4ffaa1a4490fe115c924cec16a9
// sendPostNotifications('0x44a8a6bd7f84d4ffaa1a4490fe115c924cec16a9', 'Onchain since 2016');

// https://warpcast.com/boris/0x054669aa3de834004b2a1913e7f1b477456be548
// sendPostNotifications('0x054669aa3de834004b2a1913e7f1b477456be548', 'Over 1,000 txs');

// https://warpcast.com/0xrob/0xef6b6c886e7ef5067aba25c4e8762d9385758d4c
// sendPostNotifications('0xef6b6c886e7ef5067aba25c4e8762d9385758d4c', 'Over 1,000 txs');

// https://warpcast.com/grunt/0x925e385409b0bace23b5f1698021fa1736edccb5
// sendPostNotifications('0x925e385409b0bace23b5f1698021fa1736edccb5', 'Beacon Deposit > 256ETH');

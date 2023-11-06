import 'dotenv/config';
import axios from 'axios';
import {
  VerificationsByFidResponse,
  UserProfile,
  FidsResponse,
  HubEventsResponse,
  MergeMessageBody,
  HubEvent,
} from '../types';
import { Hex } from 'viem';
import { batchRun, retry } from '../utils';
import prisma from '../prisma';

const HUBBLE_URL = 'http://127.0.0.01:2281/v1';

const queryHubble = async <T>(method: string, params: { [key: string]: string }): Promise<T> => {
  return await retry(async () => {
    const { data } = await axios.get(`${HUBBLE_URL}/${method}`, {
      params,
    });

    return data;
  });
};

export const getFIDs = async ({ limit }: { limit?: number } = {}): Promise<number[]> => {
  const allFids = [];

  let nextPageToken = '';
  while (true) {
    const res = await queryHubble<FidsResponse>('fids', {
      pageToken: nextPageToken,
    });

    allFids.push(...res.fids);

    if (limit && allFids.length >= limit) {
      break;
    }

    if (!res.nextPageToken) {
      break;
    }

    nextPageToken = res.nextPageToken;
  }

  return allFids.slice(0, limit);
};

export const batchQueryHubble = async <T>(
  method: string,
  params: { [key: string]: string }[],
  batchSize: number = 100,
): Promise<T[]> => {
  const responses: T[] = [];
  for (let i = 0; i < params.length; i += batchSize) {
    const batch = params.slice(i, i + batchSize);
    const batchResponses = await Promise.all(
      batch.map(async (param) => {
        try {
          return await queryHubble<T>(method, param);
        } catch (err) {
          console.log(err);
          return null;
        }
      }),
    );

    // Filter out the errors
    const batchSuccessResponses = batchResponses.filter((r) => r !== null) as T[];

    responses.push(...batchSuccessResponses);
  }

  return responses;
};

export const getConnectedAddresses = async (fid: number): Promise<Hex[]> => {
  const { messages } = await queryHubble<VerificationsByFidResponse>('verificationsByFid', {
    fid: fid.toString(),
  });

  const connectedAddresses = messages.map((m) => m.data.verificationAddEthAddressBody.address);

  return connectedAddresses;
};

const userDataTypes = [
  {
    type: 'php',
    key: 1,
  },
  {
    type: 'displayName',
    key: 2,
  },
  {
    type: 'bio',
    key: 3,
  },
  {
    type: 'username',
    key: 6,
  },
];

// Get Farcaster user profile by FID from Hubble
export const getUserProfile = async (fid: number): Promise<UserProfile | null> => {
  let profile: any = {};
  try {
    for (const { key, type } of userDataTypes) {
      const { data } = await axios.get(HUBBLE_URL + '/userDataByFid', {
        params: {
          fid,
          user_data_type: key,
        },
      });

      const value = data.data.userDataBody.value;
      if (value) {
        profile[type] = value;
      }
    }
  } catch (err: any) {
    return null;
  }

  return {
    fid: fid.toString(),
    pfp: profile.php || null,
    displayName: profile.displayName || null,
    bio: profile.bio || null,
    username: profile.username || null,
  };
};

const FC_TIMESTAMP_START = new Date('2021-01-01T00:00:00Z').getTime() / 1000;

// Convert Farcaster timestamp to Unix timestamp in milliseconds
const toUnixTimestamp = (fcTimestamp: number): number => {
  return (FC_TIMESTAMP_START + fcTimestamp) * 1000;
};

export const saveUserProfiles = async (fids: number[]) => {
  const users = await Promise.all(
    fids.map(async (fid) => {
      const profile = await getUserProfile(fid);

      return {
        fid,
        fcUsername: profile?.username,
        displayName: profile?.displayName,
        pfp: profile?.pfp,
        bio: profile?.bio,
      };
    }),
  );

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
};

export const saveConnectedAddresses = async (fids: number[]) => {
  const connectedAddresses = (
    await Promise.all(
      fids.map(async (fid) => {
        const addresses = await getConnectedAddresses(fid);
        return addresses.map((address) => ({
          userFid: fid,
          address,
        }));
      }),
    )
  ).flat();

  await prisma.connectedAddress.createMany({
    data: connectedAddresses,
    skipDuplicates: true,
  });
};

// Sync Farcaster user profiles
const getAllUsers = async () => {
  const fids = await getFIDs();

  await batchRun(
    async (fids: number[]) => {
      const users = await Promise.all(
        fids.map(async (fid) => {
          const profile = await getUserProfile(fid);

          return {
            fid,
            fcUsername: profile?.username,
            displayName: profile?.displayName,
            pfp: profile?.pfp,
            bio: profile?.bio,
          };
        }),
      );

      await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
      });
    },
    fids,
    'Sync users',
  );
};

// Get all connected addresses for all Farcaster users
const getAllConnectedAddresses = async () => {
  const users = await prisma.user.findMany({
    select: {
      fid: true,
    },
  });
  const fids = users.map((u) => u.fid);

  await batchRun(
    async (fids: number[]) => {
      const connectedAddresses = (
        await Promise.all(
          fids.map(async (fid) => {
            const addresses = await getConnectedAddresses(fid);
            return addresses.map((address) => ({
              userFid: fid,
              address,
            }));
          }),
        )
      ).flat();

      await prisma.connectedAddress.createMany({
        data: connectedAddresses,
        skipDuplicates: true,
      });
    },
    fids,
    'Sync addresses',
  );
};

// Sync Farcaster users
export const syncUsers = async () => {
  const latestEvent = await prisma.hubEventsSyncInfo.findFirst({
    select: {
      synchedEventId: true,
    },
  });

  if (!latestEvent) {
    // When no hub events have been processed yet, sync all users
    // await getAllUsers();
    await getAllConnectedAddresses();

    const result = await queryHubble<HubEventsResponse>('events', {
      reverse: '1',
    });
    await prisma.hubEventsSyncInfo.upsert({
      where: {
        eventType: 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS',
      },
      update: {
        synchedEventId: result.nextPageEventId,
      },
      create: {
        eventType: 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS',
        synchedEventId: result.nextPageEventId,
      },
    });
  } else {
    // The latest event ID that has been processed
    let nextPageEventId = latestEvent?.synchedEventId || 0;

    while (true) {
      const result = await queryHubble<HubEventsResponse>('events', {
        from_event_id: nextPageEventId.toString(),
      });

      const events = result.events;

      // Save all the users that have been added
      const updatedFids = events
        .filter((e) => {
          const messageType = e.mergeMessageBody?.message.data.type;
          return (
            messageType === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS' ||
            messageType === 'MESSAGE_TYPE_USER_DATA_ADD'
          );
        })
        .map((e) => (e.mergeMessageBody as MergeMessageBody).message.data.fid);

      await saveUserProfiles(updatedFids);
      await saveConnectedAddresses(updatedFids);

      const latestEventTimestamp =
        events[events.length - 1]?.mergeMessageBody?.message.data.timestamp;

      if (latestEventTimestamp) {
        const syncTarget = new Date().getTime() - 1000 * 5; // 5 seconds ago
        if (toUnixTimestamp(latestEventTimestamp) > syncTarget) {
          console.log('Sync target reached');
          break;
        }
      }

      nextPageEventId = result.nextPageEventId;

      if (!nextPageEventId) {
        break;
      } else {
        await prisma.hubEventsSyncInfo.upsert({
          where: {
            eventType: 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS',
          },
          update: {
            synchedEventId: result.nextPageEventId,
          },
          create: {
            eventType: 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS',
            synchedEventId: result.nextPageEventId,
          },
        });
      }
    }
  }
};

import 'dotenv/config';
import axios from 'axios';
import { VerificationsByFidResponse, UserProfile, FidsResponse } from '../types';
import { Hex } from 'viem';
import { retry } from '../utils';

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

export const batchRun = async <T>(
  fn: (params: T[]) => Promise<void>,
  params: T[],
  batchSize: number = 100,
) => {
  for (let i = 0; i < params.length; i += batchSize) {
    console.time(`batch ${i} - ${i + batchSize}`);
    const batch = params.slice(i, i + batchSize);
    await fn(batch);
    console.timeEnd(`batch ${i} - ${i + batchSize}`);
  }
};

export const getConnectedAddresses = async (fid: number): Promise<Hex[]> => {
  const { messages } = await queryHubble<VerificationsByFidResponse>('verificationsByFid', {
    fid: fid.toString(),
  });

  for (const message of messages) {
    if (message.data.type !== 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS') {
      console.log(message);
    }
  }

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

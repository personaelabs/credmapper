import 'dotenv/config';
import axios from 'axios';
import { VerificationsByFidResponse, UserProfile, FidsResponse } from '../types';
import { Hex } from 'viem';

const HUBBLE_URL = 'http://127.0.0.01:2281/v1';

const queryHubble = async <T>(method: string, params: { [key: string]: string }): Promise<T> => {
  const { data } = await axios.get(`${HUBBLE_URL}/${method}`, {
    params,
  });

  return data;
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

export const batchRun = async <T, R>(
  fn: (params: T) => Promise<R>,
  params: T[],
  batchSize: number = 100,
) => {
  const responses: R[] = [];
  for (let i = 0; i < params.length; i += batchSize) {
    console.time(`batch ${i} - ${i + batchSize}`);
    const batch = params.slice(i, i + batchSize);
    const batchResponses = await Promise.all(batch.map((param) => fn(param)));
    responses.push(...batchResponses);
    console.timeEnd(`batch ${i} - ${i + batchSize}`);
  }

  return responses;
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

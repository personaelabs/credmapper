import { Hex, HttpTransport, PublicClient } from 'viem';
import * as chains from 'viem/chains';
import { NUM_MAINNET_CLIENTS, getClient } from './providers/ethRpc';

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(fn: () => Promise<T>, retries = 5, interval = 1000): Promise<T> => {
  let retried = 0;
  let error: any;
  while (true) {
    try {
      return await fn();
    } catch (_err: any) {
      if (retried >= retries) {
        error = _err;
        break;
      } else {
        retried++;
        await sleep(interval);
      }
    }
  }

  throw error;
};

export const batchRun = async <T>(
  fn: (params: T[]) => Promise<void>,
  params: T[],
  operationLabel: string = '',
  batchSize: number = 100,
) => {
  for (let i = 0; i < params.length; i += batchSize) {
    console.log(`${operationLabel} ${i}/${params.length}`);
    const batch = params.slice(i, i + batchSize);
    await fn(batch);
  }
};

export const trimAddress = (address: Hex) => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const binarySearch = (arr: bigint[], target: bigint): number => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid; // Target value found
    }

    if (arr[mid] < target) {
      left = mid + 1; // Search in the right half
    } else {
      right = mid - 1; // Search in the left half
    }
  }

  return -1; // Target not found
};

export const runInParallel = async <T>(
  fn: (client: PublicClient<HttpTransport, chains.Chain>, params: T) => Promise<void>,
  params: T[],
) => {
  let promises = [];

  for (let i = 0; i < params.length; i++) {
    const clientIndex = i % NUM_MAINNET_CLIENTS;
    const client = getClient(chains.mainnet, clientIndex);
    promises.push(fn(client, params[i]));

    if (promises.length === NUM_MAINNET_CLIENTS) {
      await Promise.all(promises);
      promises = [];
    }
  }

  await Promise.all(promises);
};

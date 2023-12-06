import { Hex, HttpTransport, PublicClient } from 'viem';
import * as chains from 'viem/chains';
import { NUM_MAINNET_CLIENTS, getClient } from './providers/ethRpc';
import etherscan from './providers/etherscan';
import chalk from 'chalk';

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
  let queuedParams = params.map((param, i) => {
    return {
      param,
      index: i,
    };
  });
  const activePromises = [];
  let activeClients: number[] = [];

  const allClientIds = new Array(NUM_MAINNET_CLIENTS).fill(0).map((_, i) => i);

  const getAvailableClientId = (): number => {
    const nonActiveClients = allClientIds.filter((clientId) => !activeClients.includes(clientId));
    return nonActiveClients[0];
  };

  while (true) {
    while (queuedParams.length > 0 && activeClients.length < NUM_MAINNET_CLIENTS) {
      const clientId = getAvailableClientId();
      const client = getClient(chains.mainnet, clientId);

      const queuedParam = queuedParams[0];
      const param = queuedParam.param;
      const promise = fn(client, param)
        .then(() => {
          activeClients = activeClients.filter((id) => id !== clientId);
          console.log(
            chalk.green(
              `Completed job ${queuedParam.index}/${params.length} with client ${clientId}`,
            ),
          );
        })
        .catch((err) => {
          console.error(err);
          activeClients = activeClients.filter((id) => id !== clientId);
          console.log(
            chalk.red(`Failed job ${queuedParam.index}/${params.length} with client ${clientId}`),
          );
        });

      activePromises.push(promise);
      activeClients.push(clientId);

      console.log(
        chalk.blue(`Started job ${queuedParam.index}/${params.length} with client ${clientId}`),
      );

      queuedParams.shift();
    }

    if (queuedParams.length === 0 && activePromises.length === 0) {
      console.log(chalk.green('All jobs completed'));
      break;
    }

    await sleep(3000); // Wait 3 seconds
  }
};

export const findBlockNumberByTimestamp = async (targetDate: Date): Promise<bigint> => {
  const { data } = await etherscan(chains.mainnet).get('', {
    params: {
      module: 'block',
      action: 'getblocknobytime',
      timestamp: Math.round(targetDate.getTime() / 1000),
      closest: 'before',
    },
  });

  return BigInt(data.result as string);
};

import { Abi, Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import prisma from '../prisma';
import { Chain as DBChain } from '@prisma/client';

// Sync logs for a specific event.
// Use `syncContractLogs` to sync logs for a specific contract.
export const syncLogs = async <T extends Transport, C extends Chain>(
  client: PublicClient<T, C>,
  eventName: string,
  eventInputs: any,
  fromBlock: bigint,
  saveLogs: (logs: GetFilterLogsReturnType) => Promise<void>,
  batchSize: bigint = BigInt(10000),
) => {
  // Get the latest block number
  const latestBlock = await client.getBlockNumber();

  for (let batchFrom = fromBlock; batchFrom < latestBlock; batchFrom += batchSize) {
    console.log(
      `Sync: ${eventName} (${
        client.chain.name
      }) ${batchFrom.toLocaleString()}/${latestBlock.toLocaleString()}`,
    );

    try {
      const logs = await client.getLogs({
        event: {
          inputs: eventInputs,
          name: eventName,
          type: 'event',
        },
        fromBlock: batchFrom,
        toBlock: batchFrom + batchSize,
      });

      await saveLogs(logs);

      await prisma.syncInfo.upsert({
        where: {
          eventName_chain: {
            eventName,
            chain: DBChain.Zora,
          },
        },
        update: {
          synchedBlock: batchFrom + batchSize,
        },
        create: {
          eventName,
          chain: DBChain.Zora,
          synchedBlock: batchFrom + batchSize,
        },
      });
    } catch (err) {
      console.log(
        `Failed to fetch ${eventName} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

// Sync logs for a specific contract or multiple contracts.
export const syncContractLogs = async <T extends Transport, C extends Chain>(
  client: PublicClient<T, C>,
  abi: Abi,
  contractAddress: Hex | Hex[] | undefined,
  eventName: string,
  fromBlock: bigint,
  saveLogs: (logs: GetFilterLogsReturnType) => Promise<void>,
  batchSize: bigint = BigInt(10000),
) => {
  // Get the latest block number
  const latestBlock = await client.getBlockNumber();

  for (let batchFrom = fromBlock + BigInt(1); batchFrom < latestBlock; batchFrom += batchSize) {
    console.log(
      `Sync: ${eventName} (${
        client.chain.name
      }) ${batchFrom.toLocaleString()}/${latestBlock.toLocaleString()}`,
    );

    try {
      const logs = await client.getContractEvents({
        address: contractAddress,
        eventName,
        abi,
        fromBlock: batchFrom,
        toBlock: batchFrom + batchSize,
      });

      await saveLogs(logs);

      await prisma.syncInfo.upsert({
        where: {
          eventName_chain: {
            eventName,
            chain: DBChain.Zora,
          },
        },
        update: {
          synchedBlock: batchFrom + batchSize,
        },
        create: {
          eventName,
          chain: DBChain.Zora,
          synchedBlock: batchFrom + batchSize,
        },
      });
    } catch (err) {
      console.log(
        `Failed to fetch ${eventName} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

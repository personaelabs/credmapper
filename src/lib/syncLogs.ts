import { Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import prisma from '../prisma';
import { Chain as DBChain } from '@prisma/client';
import { getClient } from '../providers/ethRpc';

// Sync logs for a specific event.
// Use `syncContractLogs` to sync logs for a specific contract.
export const syncLogs = async <T extends Transport, C extends Chain>(
  chain: DBChain,
  eventName: string,
  eventInputs: any,
  fromBlock: bigint,
  saveLogs: (logs: GetFilterLogsReturnType) => Promise<void>,
  contractAddress?: Hex | Hex[],
  batchSize: bigint = BigInt(10000),
) => {
  const client = getClient(chain);

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
        address: contractAddress,
        event: {
          inputs: eventInputs,
          name: eventName,
          type: 'event',
        },
        fromBlock: batchFrom,
        toBlock: batchFrom + batchSize,
        args: {
          from: '0x0000000000000000000000000000000000000000',
        },
      });

      await saveLogs(logs);

      await prisma.syncInfo.upsert({
        where: {
          eventName_chain: {
            eventName,
            chain,
          },
        },
        update: {
          synchedBlock: batchFrom + batchSize,
        },
        create: {
          eventName,
          chain,
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

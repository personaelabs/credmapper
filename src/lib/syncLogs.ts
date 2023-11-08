import { Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import prisma from '../prisma';
import { Chain as DBChain } from '@prisma/client';
import { getClient } from '../providers/ethRpc';
import { AbiEvent } from 'abitype';

// Sync logs for a specific event.
// Use `syncContractLogs` to sync logs for a specific contract.
export const syncLogs = async <T extends Transport, C extends Chain>(
  chain: DBChain,
  event: AbiEvent,
  fromBlock: bigint,
  saveLogs: (logs: GetFilterLogsReturnType) => Promise<void>,
  contractAddress?: Hex | Hex[],
  batchSize: bigint = BigInt(1000),
) => {
  const client = getClient(chain);

  // Get the latest block number
  const latestBlock = await client.getBlockNumber();

  for (let batchFrom = fromBlock; batchFrom < latestBlock; batchFrom += batchSize) {
    console.log(
      `Sync: ${event.name} (${
        client.chain.name
      }) ${batchFrom.toLocaleString()}/${latestBlock.toLocaleString()}`,
    );

    try {
      const logs = await client.getLogs({
        address: contractAddress,
        event,
        fromBlock: batchFrom,
        toBlock: batchFrom + batchSize,
        strict: true,
      });

      await saveLogs(logs);
    } catch (err) {
      console.log(
        `Failed to fetch ${event.name} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

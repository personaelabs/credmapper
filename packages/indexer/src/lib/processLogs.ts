import { Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import prisma from '../prisma';
import { getClient } from '../providers/ethRpc';
import { AbiEvent } from 'abitype';
import { ContractWithDeployedBlock } from '../types';

// Sync logs for a specific event.
// Use `syncContractLogs` to sync logs for a specific contract.
export const processLogs = async <T extends Transport, C extends Chain>(
  chain: Chain,
  event: AbiEvent,
  fromBlock: bigint,
  processor: (logs: GetFilterLogsReturnType) => Promise<void>,
  contract: ContractWithDeployedBlock,
  batchSize: bigint = BigInt(2000),
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
        address: contract.address,
        event,
        fromBlock: batchFrom,
        toBlock: batchFrom + batchSize,
        strict: true,
      });

      await processor(logs);
    } catch (err) {
      console.log(
        `Failed to fetch ${event.name} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

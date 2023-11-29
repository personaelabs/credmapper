import { Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import prisma from '../prisma';
import { getClient } from '../providers/ethRpc';
import { AbiEvent } from 'abitype';
import { ContractWithDeployedBlock } from '../types';
import { sleep, trimAddress } from '../utils';

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
    try {
      const startTime = Date.now();

      client
        .getLogs({
          address: contract.address,
          event,
          fromBlock: batchFrom,
          toBlock: batchFrom + batchSize,
          strict: true,
        })
        .then(processor)
        .catch((err) => {
          console.log(err);
        });
      await sleep(150);

      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;

      const blocksPerSecond = Math.round(Number(batchSize) / timeTaken);
      console.log(
        `Sync: ${trimAddress(contract.address)} (${
          client.chain.name
        }) ${batchFrom.toLocaleString()}/${latestBlock.toLocaleString()}, ${blocksPerSecond}/bps`,
      );
    } catch (err) {
      console.log(
        `Failed to fetch ${event.name} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

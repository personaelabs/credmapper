import {
  AbiEncodingLengthMismatchError,
  Chain,
  GetFilterLogsReturnType,
  Hex,
  PublicClient,
  Transport,
} from 'viem';
import { AbiEvent } from 'abitype';
import { ContractWithDeployedBlock } from '../types';
import { trimAddress } from '../utils';

// Sync logs for a specific event.
// Use `syncContractLogs` to sync logs for a specific contract.
export const processLogs = async <T extends Transport, C extends Chain>(
  client: PublicClient<T, C>,
  event: AbiEvent,
  fromBlock: bigint,
  processor: (
    logs: GetFilterLogsReturnType,
    args?: {
      fromBlock: bigint;
      toBlock: bigint;
    },
  ) => Promise<void>,
  contract: ContractWithDeployedBlock,
  batchSize: bigint = BigInt(2000),
  accumulateLogs?: number,
) => {
  // Get the latest block number
  const latestBlock = await client.getBlockNumber();

  let batch = [];
  for (let batchFrom = fromBlock; batchFrom < latestBlock; batchFrom += batchSize) {
    try {
      const startTime = Date.now();

      const toBlock = batchFrom + batchSize;
      const logs = await client.getLogs({
        address: contract.address,
        event,
        fromBlock: batchFrom,
        toBlock,
        strict: true,
      });

      if (accumulateLogs) {
        batch.push(...logs);
      }

      if (accumulateLogs) {
        if (batch.length >= accumulateLogs) {
          console.log(`Processing ${batch.length} logs`);
          await processor(batch, {
            fromBlock: batchFrom,
            toBlock,
          });

          batch = [];
        }
      } else {
        await processor(logs, {
          fromBlock: batchFrom,
          toBlock,
        });
      }

      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;

      const blocksPerSecond = Math.round(Number(batchSize) / timeTaken);
      console.log(
        `Sync: ${trimAddress(contract.address)} (${
          client.chain.name
        }) ${batchFrom.toLocaleString()}/${latestBlock.toLocaleString()}, ${blocksPerSecond} bps`,
      );
    } catch (err) {
      console.log(
        `Failed to fetch ${event.name} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

import { Chain, GetFilterLogsReturnType, PublicClient, Transport } from 'viem';
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
  lastBlock?: bigint,
) => {
  // Get the latest block number
  const latestBlock = await client.getBlockNumber();

  let batch = [];
  for (let batchFrom = fromBlock; batchFrom < (lastBlock || latestBlock); batchFrom += batchSize) {
    try {
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
    } catch (err) {
      console.log(
        `Failed to fetch ${event.name} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

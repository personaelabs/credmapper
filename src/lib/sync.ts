import { Abi, Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import { retry } from '../utils';
import prisma from '../prisma';

// Link ConnectedAddress to creators
export const linkDrops = async (address: Hex) => {
  const result = await prisma.createDropEvent.updateMany({
    where: {
      creator: address,
    },
    data: {
      connectedCreator: address,
    },
  });
  if (result.count > 0) {
    console.log(`Linked ${result.count} drops to ${address}`);
  }
};

export const syncLogs = async <T extends Transport, C extends Chain>(
  client: PublicClient<T, C>,
  abi: Abi,
  contractAddress: Hex,
  eventName: string,
  fromBlock: bigint,
  saveLogs: (logs: GetFilterLogsReturnType) => Promise<void>,
) => {
  console.log(`Syncing ${eventName} events from ${fromBlock}`);

  // Get the latest block number
  const latestBlock = await client.getBlockNumber();

  const batchSize = BigInt(10000);

  for (let batchFrom = fromBlock + BigInt(1); batchFrom < latestBlock; batchFrom += batchSize) {
    console.log(`Fetching events from ${batchFrom} to ${batchFrom + batchSize}`);

    try {
      const filter = await retry(async () => {
        return await client.createContractEventFilter({
          abi,
          address: contractAddress,
          eventName,
          args: {},
          fromBlock: batchFrom,
          toBlock: batchFrom + batchSize,
        });
      });

      const logs = await retry(async () => {
        return await client.getFilterLogs({ filter });
      });

      await saveLogs(logs);
    } catch (err) {
      console.log(
        `Failed to fetch ${eventName} events from ${batchFrom} to ${batchFrom + batchSize}`,
      );
      console.log(err);
    }
  }
};

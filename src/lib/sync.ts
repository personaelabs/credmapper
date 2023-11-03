import { Abi, Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import { ToDBChain, retry } from '../utils';
import prisma from '../prisma';

export const linkAddressTraits = async (address: Hex) => {
  // Link foreign keys
  await prisma.transferEvent.updateMany({
    data: {
      connecttedTo: address,
    },
    where: {
      to: address,
    },
  });

  await prisma.createDropEvent.updateMany({
    data: {
      connectedCreator: address,
    },
    where: {
      creator: address,
    },
  });
};

export const syncContractLogs = async <T extends Transport, C extends Chain>(
  client: PublicClient<T, C>,
  abi: Abi,
  contractAddress: Hex | Hex[],
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

      await prisma.syncInfo.upsert({
        where: {
          eventName_chain: {
            eventName,
            chain: ToDBChain(client.chain),
          },
        },
        update: {
          synchedBlock: batchFrom + batchSize,
        },
        create: {
          eventName,
          chain: ToDBChain(client.chain),
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

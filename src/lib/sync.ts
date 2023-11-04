import { Abi, Chain, GetFilterLogsReturnType, Hex, PublicClient, Transport } from 'viem';
import { ToDBChain, retry } from '../utils';
import prisma from '../prisma';

export const linkAddressTraits = async (address: Hex) => {
  // Link foreign keys
  await prisma.transferEvent.updateMany({
    data: {
      connectedAddress: address,
    },
    where: {
      to: address,
    },
  });
};

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

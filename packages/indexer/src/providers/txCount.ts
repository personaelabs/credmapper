import { Hex } from 'viem';
import { batchRun } from '../utils';
import prisma from '../prisma';
import * as chains from 'viem/chains';
import { getClient } from './ethRpc';

export const indexChains = [chains.mainnet, chains.optimism, chains.base];

export const indexTxCount = async () => {
  // Get addresses that don't have > 100 txs as of the last sync
  const addresses = (
    await prisma.txCount.findMany({
      where: {
        txCount: {
          lte: 100,
        },
      },
      select: {
        address: true,
      },
    })
  ).map((r) => r.address as Hex);

  for (const chain of indexChains) {
    const client = getClient(chain);
    await batchRun(
      async (batch) => {
        try {
          const txCounts = await Promise.all(
            batch.map(async (address) => ({
              address,
              network: chain.name,
              txCount: await client.getTransactionCount({ address }),
            })),
          );

          await prisma.txCount.createMany({
            data: txCounts,
            skipDuplicates: true,
          });
        } catch (err) {
          console.error(err);
        }
      },
      addresses,
      `txCount (${chain.name})`,
      20,
    );
  }
};

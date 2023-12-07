import { Hex } from 'viem';
import { batchRun } from '../utils';
import prisma from '../prisma';
import * as chains from 'viem/chains';
import { getClient } from './ethRpc';
import { getAllAddresses } from './farcaster';

export const indexTxCount = async (threshold: number) => {
  const connectedAddresses = (await getAllAddresses())
    .map((r) => r.verified_addresses as Hex[])
    .flat();

  // Get addresses that don't have > [threshold] txs as of the last sync
  const addressesWithManyTxs = (
    await prisma.txCount.findMany({
      where: {
        txCount: {
          lte: threshold,
        },
      },
      select: {
        address: true,
      },
    })
  ).map((r) => r.address as Hex);

  // Remove addresses that already have > 100 txs
  const addressesToIndex = connectedAddresses.filter(
    (address) => !addressesWithManyTxs.includes(address),
  );

  const client = getClient(chains.mainnet);
  await batchRun(
    async (batch) => {
      try {
        const txCounts = await Promise.all(
          batch.map(async (address) => ({
            address,
            network: chains.mainnet.name,
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
    addressesToIndex,
    `txCount (${chains.mainnet.name})`,
    20,
  );
};

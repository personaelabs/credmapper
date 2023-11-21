import { Alchemy, Network } from 'alchemy-sdk';
import { Hex } from 'viem';
import { batchRun } from '../utils';
import prisma from '../prisma';
import { Venue } from '@prisma/client';

// Optional config object, but defaults to the API key 'demo' and Network 'eth-mainnet'.
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

// Returns the current transaction count of the address.
export const getTransactionCount = async (address: Hex): Promise<number> => {
  const txCount = await alchemy.core.getTransactionCount(address);
  return txCount;
};

export const syncTxCount = async (addresses: Hex[], venue: Venue) => {
  await batchRun(
    async (batch) => {
      try {
        const txCounts = await Promise.all(
          batch.map(async (address) => ({
            address,
            txCount: await getTransactionCount(address),
            venue,
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
    'txCount',
    20,
  );
};

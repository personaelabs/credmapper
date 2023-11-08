import prisma from './prisma';
import { sync1155Tokens, syncPurchasedEvents } from './providers/zora';
import { Hex } from 'viem';
import { batchRun } from './utils';
import { sync721Tokens, syncTransferEvents } from './providers/zora/721';
import { Chain } from '@prisma/client';
import { syncUsers } from './providers/farcaster';

// Link the traits indexed by the above functions
// to the Farcaster addresses
const linkAddressTraits = async () => {
  // Get the latest link time

  // When there is no past link info, link all addresses
  const addresses = await prisma.connectedAddress.findMany({
    select: {
      address: true,
    },
  });

  await batchRun(
    async (addresses: Hex[]) => {
      await Promise.all(
        addresses.map(async (address) => {
          // Link foreign keys
          await prisma.purchasedEvent.updateMany({
            data: {
              connectedAddress: address,
            },
            where: {
              minter: address,
            },
          });

          await prisma.transferEvent.updateMany({
            data: {
              connectedAddress: address,
            },
            where: {
              to: address,
            },
          });
        }),
      );
    },
    addresses.map((a) => a.address as Hex),
    'Link traits',
  );
};

const syncEthereum = async () => {
  const chain = Chain.Ethereum;
  await syncTransferEvents(chain, [
    // '0xca21d4228cdcc68d4e23807e5e370c07577dd152', // Zorbs
    // '0x6339e5e072086621540d0362c4e3cea0d643e114', // Opepen Edition
    // '0x9d90669665607f08005cae4a7098143f554c59ef', // Stand with crypto
    '0x06012c8cf97bead5deae237070f9587f8e7a266d', // Cryptokitties
    // '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', // CryptoPunks
  ] as Hex[]);
  await sync721Tokens(chain);
};

// We only go through hand-picked contracts on Ethereum
const syncZora = async () => {
  const chain = Chain.Zora;
  await syncPurchasedEvents(chain);
  // await syncTransferEvents(chain);
  await sync1155Tokens(chain);
  await sync721Tokens(chain);
};

const sync = async () => {
  console.time('Sync time');

  await syncUsers();
  /*
  await syncEthereum();
  await syncZora();

  await linkAddressTraits();
  */

  console.timeEnd('Sync time');
};

sync();

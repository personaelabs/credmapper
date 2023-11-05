import { syncUsers } from './providers/farcaster';
import prisma from './prisma';
import { sync1155Tokens, syncPurchasedEvents } from './providers/zora';
import { Hex } from 'viem';
import { batchRun } from './utils';

const linkAddressTraits = async () => {
  // Get the latest link time
  const linkInfo = await prisma.linkInfo.findFirst();

  let addresses;
  if (!linkInfo) {
    // When there is no past link info, link all addresses
    addresses = await prisma.connectedAddress.findMany({
      select: {
        address: true,
      },
    });
  } else {
    const unlinkedPurchases = await prisma.purchasedEvent.findMany({
      where: {
        connectedAddress: null,
        updatedAt: {
          gte: linkInfo.latestLinkTime,
        },
      },
      select: {
        minter: true,
      },
    });

    // Get all addresses that might have new links since the last link time
    addresses = await prisma.connectedAddress.findMany({
      where: {
        OR: [
          {
            address: {
              in: unlinkedPurchases.map((p) => p.minter),
            },
          },
          {
            createdAt: {
              gte: linkInfo.latestLinkTime,
            },
          },
        ],
      },
      select: {
        address: true,
      },
    });
  }

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
        }),
      );
    },
    addresses.map((a) => a.address as Hex),
    'Link traits',
  );

  // Update the latest link time
  await prisma.linkInfo.upsert({
    where: {
      id: 1,
    },
    update: {
      latestLinkTime: new Date(),
    },
    create: {
      id: 1,
      latestLinkTime: new Date(),
    },
  });
};

const sync = async () => {
  console.time('Sync time');
  // 1155 contracts
  await syncPurchasedEvents();
  await sync1155Tokens();

  // Sync Farcaster users
  await syncUsers();

  // Link the traits indexed by the above functions
  // to the Farcaster addresses
  await linkAddressTraits();
  console.timeEnd('Sync time');
};

sync();

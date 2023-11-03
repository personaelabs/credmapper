import { batchRun, getConnectedAddresses, getFIDs, getUserProfile } from './providers/farcaster';
import prisma from './prisma';
import {
  syncCreatedDrops,
  syncEditionInitialized,
  syncMetadataUpdated,
  syncTransfers,
} from './providers/zora';
import { linkAddressTraits } from './lib/sync';
import { Hex } from 'viem';

// Sync Farcaster user profiles
const syncUsers = async () => {
  const latestHubEvent = await prisma.hubEvent.findFirst({
    orderBy: { timestamp: 'desc' },
  });

  if (!latestHubEvent) {
    const fids = await getFIDs();

    await batchRun(
      async (fids: number[]) => {
        const users = await Promise.all(
          fids.map(async (fid) => {
            const profile = await getUserProfile(fid);

            return {
              fid,
              fcUsername: profile?.username,
              displayName: profile?.displayName,
              pfp: profile?.pfp,
              bio: profile?.bio,
            };
          }),
        );

        await prisma.user.createMany({
          data: users,
          skipDuplicates: true,
        });
      },
      fids,
      'Sync users',
    );
  } else {
    // TODO: Sync new users by going through the hub events
  }
};

// Sync Farcaster connected addresses
const syncConnectedAddresses = async () => {
  const latestHubEvent = await prisma.hubEvent.findFirst({
    orderBy: { timestamp: 'desc' },
  });

  if (!latestHubEvent) {
    const users = await prisma.user.findMany({
      select: {
        fid: true,
      },
    });
    const fids = users.map((u) => u.fid);

    await batchRun(
      async (fids: number[]) => {
        const connectedAddresses = (
          await Promise.all(
            fids.map(async (fid) => {
              const addresses = await getConnectedAddresses(fid);
              return addresses.map((address) => ({
                userFid: fid,
                address,
              }));
            }),
          )
        ).flat();

        await prisma.connectedAddress.createMany({
          data: connectedAddresses,
          skipDuplicates: true,
        });
      },
      fids,
      'Sync addresses',
    );
  } else {
    // TODO: Sync new users by going through the hub events
  }
};

const linkAllAddressTraits = async () => {
  const addresses = await prisma.connectedAddress.findMany({
    select: {
      address: true,
    },
  });

  await batchRun(
    async (addresses: Hex[]) => {
      await Promise.all(addresses.map((address) => linkAddressTraits(address)));
    },
    addresses.map((a) => a.address as Hex),
    'Link traits',
  );
};

const sync = async () => {
  await syncCreatedDrops();
  await syncMetadataUpdated();
  await syncTransfers();
  await syncEditionInitialized();

  await syncUsers();

  await syncConnectedAddresses();

  // Link all the traits indexed by the above functions
  // to the Farcaster addresses
  await linkAllAddressTraits();
};

sync();

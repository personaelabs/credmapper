import { getConnectedAddresses, getFIDs, getUserProfile, syncUsers } from './providers/farcaster';
import prisma from './prisma';
import { syncPurchasedEvents, syncSetupNewContractEvents } from './providers/zora';
import { linkAddressTraits } from './lib/linkTraits';
import { Hex } from 'viem';
import { batchRun } from './utils';

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
  console.time('Sync time');
  // 1155 contracts
  await syncSetupNewContractEvents();
  await syncPurchasedEvents();

  // Sync Farcaster users
  await syncUsers();

  // Link all the traits indexed by the above functions
  // to the Farcaster addresses
  await linkAllAddressTraits();
  console.timeEnd('Sync time');
};

sync();

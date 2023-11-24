import { Venue } from '@prisma/client';
import { syncFcUsers } from '../providers/farcaster';
import prisma from '../prisma';
import { syncTxCount } from '../providers/txCount';
import { Hex } from 'viem';
import { getLensUsers } from '../providers/lens';
import { syncPackagesCred } from '../cred';

const syncUsers = async () => {
  console.time('Sync time');

  // #########################
  // 1. Sync Lens user profiles
  // #########################

  const lensUsers = await getLensUsers();

  // Save Lens users to the database.
  const createLensUsersData = [];
  for (const lensUser of lensUsers) {
    for (const address of lensUser.addresses) {
      createLensUsersData.push({
        profileId: lensUser.profile_id,
        address: address.toLowerCase(),
      });
    }
  }

  await prisma.lensUserAddress.createMany({
    data: createLensUsersData,
    skipDuplicates: true,
  });

  // Get transaction count of Lens users.

  await syncTxCount(lensUsers.map((user) => user.addresses).flat(), Venue.Lens);

  // #########################
  // 2. Sync Farcaster user profiles
  // #########################

  await syncFcUsers();

  const connectedAddresses = await prisma.connectedAddress.findMany();

  // Sync the transaction count of Connected addresses.
  await syncTxCount(
    connectedAddresses.map((address) => address.address as Hex),
    Venue.Farcaster,
  );

  console.timeEnd('Sync time');
};

syncUsers();

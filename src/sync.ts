import { Cred, Venue } from '@prisma/client';
import { getCasts, syncFcUsers } from './providers/farcaster';
import prisma from './prisma';
import { syncTxCount } from './providers/txCount';
import { Hex } from 'viem';
import { getLensUsers } from './lens';
import { syncPackagesCred } from './cred';

const sync = async () => {
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

  // #########################
  // 3. Save the latest packaged cred
  // #########################

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Adds one day in milliseconds

  // Get all addresses with over 100 txs.
  const credibleAddresses = (
    await prisma.txCount.findMany({
      select: {
        address: true,
      },
      where: {
        txCount: {
          gt: 100,
        },
      },
    })
  ).map((address) => address.address as Hex);

  // Save the latest packaged cred.
  await syncPackagesCred({
    cred: Cred.Over100Txs,
    credibleAddresses,
    startDate: yesterday,
    endDate: now,
  });

  console.timeEnd('Sync time');
};

sync();

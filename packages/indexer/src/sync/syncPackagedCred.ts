import { Cred } from '@prisma/client';
import prisma from '../prisma';
import { Hex } from 'viem';
import { syncPackagesCred } from '../cred';

const syncPackagedCred = async () => {
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
};

syncPackagedCred();

import prisma from '../prisma';
import { Hex } from 'viem';
import { syncPackagesCred } from '../cred';

const syncPackagedCred = async () => {
  // #########################
  // 3. Save the latest packaged cred
  // #########################

  const fromDate = new Date('2023-11-15T00:00:00.000Z');

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
    cred: 'over_100txs',
    credibleAddresses,
    fromDate,
  });
};

syncPackagedCred();

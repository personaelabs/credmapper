import { syncFcUsers } from '../providers/farcaster';
import prisma from '../prisma';
import { syncTxCount } from '../providers/txCount';
import { Hex } from 'viem';
import { getLensUsers } from '../providers/lens';
import { syncPackagesCred } from '../cred';

const syncUsers = async () => {
  console.time('Sync time');

  await syncFcUsers();

  const connectedAddresses = await prisma.connectedAddress.findMany();

  // Sync the transaction count of Connected addresses.
  await syncTxCount(connectedAddresses.map((address) => address.address as Hex));

  console.timeEnd('Sync time');
};

syncUsers();

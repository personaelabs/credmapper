import { getUserAddresses, indexFcUsers } from '../providers/farcaster';
import prisma from '../prisma';
import { indexTxCount } from '../providers/txCount';
import { Hex } from 'viem';

const syncUsers = async () => {
  console.time('Sync time');

  await indexFcUsers();

  const connectedAddresses = (await getUserAddresses())
    .map((r) => r.verified_addresses as Hex[])
    .flat();

  // Sync the transaction count of Connected addresses.
  await indexTxCount(connectedAddresses);

  console.timeEnd('Sync time');
};

syncUsers();

import prisma from './prisma';
import { CryptoKittyUser } from './types';
import fs from 'fs';

const THRESHOLD_BLOCK = 6990564; // 01/01/2019@12:00am (UTC)
const CRYPTO_KITTIES_CONTRACT = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
export const kitties = async () => {
  const users = await prisma.user.findMany({
    include: {
      connectedAddresses: true,
    },
  });

  const connectedAddresses = (
    await prisma.connectedAddress.findMany({
      select: {
        address: true,
      },
    })
  ).map((r) => r.address);

  const kittyTransfersTo = (
    await prisma.transferEvent.groupBy({
      by: ['to'],
      where: {
        contractAddress: CRYPTO_KITTIES_CONTRACT,
        blockNumber: {
          lte: THRESHOLD_BLOCK,
        },
        to: {
          in: connectedAddresses,
        },
      },
    })
  ).map((r) => r.to);

  const kittyTransferFrom = (
    await prisma.transferEvent.groupBy({
      by: ['from'],
      where: {
        contractAddress: CRYPTO_KITTIES_CONTRACT,
        blockNumber: {
          lte: THRESHOLD_BLOCK,
        },
        from: {
          in: connectedAddresses,
        },
      },
    })
  ).map((r) => r.from);

  const cryptoKittyUsers: CryptoKittyUser[] = [];
  for (const user of users) {
    for (const address of user.connectedAddresses) {
      if (
        kittyTransfersTo.includes(address.address) ||
        kittyTransferFrom.includes(address.address)
      ) {
        cryptoKittyUsers.push({
          fid: user.fid,
          address: address.address,
          username: user.username,
          displayName: user.displayName,
          pfp: user.pfp,
        });
      }
    }
  }

  fs.writeFileSync('CryptoKittiesPre2019.json', JSON.stringify(cryptoKittyUsers, null, 2));
};

kitties();

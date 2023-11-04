import { Hex } from 'viem';
import prisma from '../prisma';

export const linkAddressTraits = async (address: Hex) => {
  // Link foreign keys
  await prisma.purchasedEvent.updateMany({
    data: {
      connectedAddress: address,
    },
    where: {
      minter: address,
    },
  });
};

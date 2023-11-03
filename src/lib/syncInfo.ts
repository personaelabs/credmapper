import { Chain } from '@prisma/client';
import prisma from '../prisma';

// Get the last block that was synched for a given event
export const getSynchedBlock = async (
  eventName: string,
  chain: Chain,
): Promise<bigint | undefined> => {
  return (
    await prisma.syncInfo.findFirst({
      select: {
        synchedBlock: true,
      },
      where: {
        eventName,
        chain,
      },
    })
  )?.synchedBlock;
};

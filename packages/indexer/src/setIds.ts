import indexedCoins from './indexedCoins.json';

import prisma from './prisma';

const applyId = async () => {
  for (const indexedCoin of indexedCoins) {
    const label = `Updating ${indexedCoin.id}...`;
    console.log(label);
    console.time(label);
    await prisma.eRC20TransferEvent.updateMany({
      where: {
        contractAddress: indexedCoin.contract,
      },
      data: {
        contractId: indexedCoin.dbId,
      },
    });
    console.timeEnd(label);
  }
};

applyId();

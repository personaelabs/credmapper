import { ERC20TransferEvent } from '@prisma/client';
import indexedCoins from './indexedCoins.json';

import prisma from './prisma';
import { batchRun } from './utils';

const updateRow = async (rowId: number) => {
  const row = await prisma.eRC20TransferEvent.findFirst({
    take: 1,
    skip: rowId,
  });

  if (!row) {
    throw new Error('No row found');
  }

  const indexedCoin = indexedCoins.find((c) => c.contract === row.contractAddress)!;

  await prisma.eRC20TransferEvent.update({
    where: {
      transactionHash: row.transactionHash,
    },
    data: {
      contractId: indexedCoin.dbId,
    },
  });
};

const applyId = async () => {
  const batchSize = 100;
  for (let i = 0; i < 6000000; i += batchSize) {
    const startTime = Date.now();
    const promises = [];

    for (let j = 0; j < batchSize; j++) {
      promises.push(updateRow(i + j));
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    console.log(`${Math.round(batchSize / timeTaken)} rows per second`);
  }

  /*
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
  */
};

applyId();

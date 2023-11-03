import prisma from './prisma';
import { IndexedRecord, ZoraDrop } from './types';
import fs from 'fs';

const MAX_RECORD_BYTES = 10000;

export const indexCreators = async () => {
  const usersWithDrops = await prisma.user.findMany({
    include: {
      connectedAddresses: {
        include: {
          drops: true,
        },
      },
    },
    where: {
      connectedAddresses: {
        some: {
          drops: {
            some: {},
          },
        },
      },
    },
  });

  const allDropContracts = usersWithDrops
    .map((user) =>
      user.connectedAddresses
        .map((address) => address.drops.map((drop) => drop.editionContractAddress))
        .flat(),
    )
    .flat();

  const metadataUpdates = await prisma.metadataUpdateEvent.findMany({
    where: {
      contractAddress: {
        in: allDropContracts,
      },
    },
    orderBy: {
      blockNumber: 'desc',
    },
  });

  const indexedRecords: IndexedRecord[] = [];

  for (const user of usersWithDrops) {
    const dropsWithMeta: ZoraDrop[] = user.connectedAddresses
      .map((address) =>
        address.drops
          .map((drop) => {
            const meta = metadataUpdates.find(
              (metadataUpdate) => metadataUpdate.contractAddress === drop.editionContractAddress,
            );

            if (meta) {
              return {
                name: meta.name,
                image: meta.image,
                contractAddress: drop.editionContractAddress,
              };
            } else {
              return false;
            }
          })
          .flat(),
      )
      .flat()
      .filter((drop) => drop) as ZoraDrop[];

    if (dropsWithMeta.length > 0) {
      const record = {
        fid: user.fid.toString(),
        pfp: user.pfp || '',
        username: user.fcUsername || '',
        displayName: user.displayName || '',
        bio: user.bio || '',
        drops: dropsWithMeta,
      };

      const recordSize = Buffer.from(JSON.stringify(record), 'utf-8').byteLength;
      if (recordSize >= MAX_RECORD_BYTES) {
        console.log(
          `Record (fid:${record.fid}) exceeds max size ${recordSize}/${MAX_RECORD_BYTES}`,
        );
      } else {
        indexedRecords.push(record);
      }
    }
  }

  fs.writeFileSync('./index.json', JSON.stringify(indexedRecords, null, 2));
};

indexCreators();

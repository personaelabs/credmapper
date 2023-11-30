import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import EVENTS from '../providers/poap/events';
import { CurrentOwnersQueryResult } from '../types';
import { getAllAddresses } from '../providers/farcaster';
import { Hex } from 'viem';

const assignPoap = async () => {
  const userAddresses = await getAllAddresses();
  const connectedAddresses = userAddresses.map((r) => r.verified_addresses as Hex[]).flat();

  for (const event of EVENTS) {
    const cred = `${event.name}_owner`;
    const result = await prisma.$queryRaw<CurrentOwnersQueryResult[]>`
      WITH partitioned AS (
        SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY "tokenId" ORDER BY "blockNumber" DESC) AS row_number
        FROM
            "PoapTransferEvent"
        WHERE
            "tokenId" in( SELECT DISTINCT
                "tokenId" FROM "PoapEventTokenEvent"
            WHERE
                "eventId" = ${event.id})
            AND "to" IN(${Prisma.join(connectedAddresses)})
      )
        SELECT
            "to" AS "owner", "tokenId"
        FROM
            partitioned
        WHERE
            row_number = 1
    `;

    const data = result
      .map((r) => ({
        owner: r.owner,
        fid: userAddresses.find((u) => u.verified_addresses.includes(r.owner))?.fid,
      }))
      .filter((r) => {
        if (!r.fid) {
          console.log(`No fid for ${r.owner}`);
          return false;
        }
        return true;
      })
      .map((r) => ({
        fid: Number(r.fid),
        cred,
      }));

    await prisma.userCred.createMany({
      data,
      skipDuplicates: true,
    });
  }
};

export default assignPoap;

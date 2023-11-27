import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import CONTRACT_EVENTS from '../providers/erc721/contractEvents';
import { CurrentOwnersQueryResult } from '../types';
import { getUserAddresses } from '../providers/farcaster';
import { Hex } from 'viem';

const assignERC721s = async () => {
  const userAddresses = await getUserAddresses();
  const connectedAddresses = userAddresses.map((r) => r.verified_addresses as Hex[]).flat();

  for (const contractEvent of CONTRACT_EVENTS) {
    const cred = `${contractEvent.name}_owner`;
    const result = await prisma.$queryRaw<CurrentOwnersQueryResult[]>`
      WITH partitioned AS (
        SELECT
          *,
          ROW_NUMBER() OVER (PARTITION BY "tokenId" ORDER BY "blockNumber" DESC) AS row_number
        FROM
          "TransferEvent"
        WHERE
        "contractAddress" = ${contractEvent.address}
        AND "to" IN (${Prisma.join(connectedAddresses)})
      )
      SELECT
        "to" as "owner",
        "tokenId"
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

export default assignERC721s;

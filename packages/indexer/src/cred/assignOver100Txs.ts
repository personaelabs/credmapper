import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { fcReplicaClient } from '../providers/farcaster';
import { networks } from '../providers/txCount';

const assignOver100Txs = async () => {
  for (const network of networks) {
    const cred = `${network}_over100Txs`;
    const addresses = (
      await prisma.txCount.findMany({
        where: {
          network,
          txCount: {
            gt: 100,
          },
        },
        select: {
          address: true,
        },
      })
    ).map((r) => r.address);

    if (addresses.length > 0) {
      const users = await fcReplicaClient.$queryRaw<{ fid: bigint }[]>`
     WITH flatten_profiles AS (
      SELECT
        fid,
        jsonb_array_elements_text(verified_addresses) AS "address"
      FROM
        profile_with_addresses
    )
    SELECT
      *
    FROM
      flatten_profiles
    WHERE
      "address" in (${Prisma.join(addresses)})
  `;

      await prisma.userCred.createMany({
        data: users.map((r) => ({
          fid: Number(r.fid),
          cred,
        })),
        skipDuplicates: true,
      });
    }
  }
};

export default assignOver100Txs;

import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { fcReplicaClient } from '../providers/farcaster';
import * as chains from 'viem/chains';

const indexChains = [chains.mainnet, chains.optimism];

const assignAccountInfo = async () => {
  // Contract deployers
  for (const chain of indexChains) {
    const cred = `${chain.name}_contractDeployer`;
    const addresses = (
      await prisma.addressInfo.findMany({
        where: {
          network: chain.name,
          contractDeployments: {
            isEmpty: false,
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

export default assignAccountInfo;

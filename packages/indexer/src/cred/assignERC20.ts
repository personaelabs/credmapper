import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { ERC20TokenHoldingsQueryResult } from '../types';
import { getAllAddresses } from '../providers/farcaster';
import { Hex, UserRejectedRequestError } from 'viem';

const CONTRACTS = [
  /*
    {
    name: 'Uniswap',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  },
  */
  {
    name: 'Yearn',
    address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
  },
  {
    name: 'xSUSHI',
    address: '0x8798249c2e607446efb7ad49ec89dd1865ff4272',
  },
];

const assignERC20s = async () => {
  const userAddresses = await getAllAddresses();
  const connectedAddresses = userAddresses.map((r) => r.verified_addresses as Hex[]).flat();

  for (const contract of CONTRACTS) {
    const cred = `${contract.name}_owner`;
    const result = await prisma.$queryRaw<ERC20TokenHoldingsQueryResult[]>`
      WITH transfers_to AS (
        SELECT
            "to",
            SUM(CAST("value" AS numeric)) AS total_value_in
        FROM
            "ERC20TransferEvent"
        WHERE
            "contractAddress" = ${contract.address} 
            AND "to" in (${Prisma.join(connectedAddresses)})
        GROUP BY
            "to"
        ),transfers_from AS (
            SELECT
                "from",
                SUM(CAST("value" AS numeric)) AS total_value_out
            FROM
                "ERC20TransferEvent"
            WHERE
                "contractAddress" = ${contract.address}
                AND "from" in (${Prisma.join(connectedAddresses)})
            GROUP BY
                "from"
        )
        SELECT
            transfers_to.total_value_in,
            transfers_from.total_value_out,
            transfers_to.to AS address
        FROM
            transfers_to
            LEFT JOIN transfers_from ON transfers_to.to = transfers_from.from
    `;

    const currentHolderAddresses = result
      .filter((r) => r.total_value_in > r.total_value_out)
      .map((r) => r.address);

    const data = currentHolderAddresses
      .map((address) => userAddresses.find((u) => u.verified_addresses.includes(address))?.fid)
      .filter((fid) => fid)
      .map((fid) => ({
        fid: fid as bigint,
        cred,
      }));

    await prisma.userCred.createMany({
      data,
      skipDuplicates: true,
    });

    await prisma.userCred.deleteMany({
      where: {
        cred,
        fid: {
          notIn: data.map((d) => d.fid),
        },
      },
    });
  }
};

export default assignERC20s;

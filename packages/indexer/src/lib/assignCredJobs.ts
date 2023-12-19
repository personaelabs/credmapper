import prisma from '../prisma';
import { syncFirstTxs } from '../providers/firstTx';
import { syncBeaconDepositors } from '../providers/beaconDepositor/beaconDepositor';
import { getAllAddresses } from '../providers/farcaster';
import { indexTxCount } from '../providers/txCount';
import { Cred } from '../types';
import { syncPoap } from '../providers/poap/poap';
import { syncERC721 } from '../providers/erc721/erc721';

// Utility function to assign cred to Farcaster users
const assignCredToFcUsersByAddress = async (cred: Cred, addresses: string[]) => {
  const userAddresses = await getAllAddresses();

  const fids = userAddresses
    .map(({ fid, verified_addresses }) => {
      if (verified_addresses.some((a) => addresses.includes(a))) {
        return fid;
      }
      return null;
    })
    .filter((a) => a !== null) as bigint[];

  await prisma.userCred.createMany({
    data: fids.map((fid) => ({
      fid: Number(fid),
      cred: cred.toString(),
    })),
    skipDuplicates: true,
  });
};

const getPoapOwners = async (eventId: number): Promise<string[]> => {
  await syncPoap();

  const result = await prisma.$queryRaw<{ address: string }[]>`
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
                "eventId" = ${eventId})
      )
        SELECT
            "to" AS "address"
        FROM
            partitioned
        WHERE
            row_number = 1
    `;

  return result.map(({ address }) => address);
};

const getERC721Owners = async (contractId: number): Promise<string[]> => {
  await syncERC721();

  const result = await prisma.$queryRaw<{ address: string }[]>`
      WITH partitioned AS (
        SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY "tokenId" ORDER BY "blockNumber" DESC) AS row_number
        FROM
            "TransferEvent"
        WHERE
            "tokenId" in( SELECT DISTINCT
                "tokenId" FROM "TransferEvent"
            WHERE
                "contractId" = ${contractId})
        AND "contractId" = ${contractId}
      )
        SELECT
            "to" AS "address"
        FROM
            partitioned
        WHERE
            row_number = 1
    `;

  return result.map(({ address }) => address);
};

/**
 * Spotlight cred
 */

// Sync and assign cred to users who have the beacon genesis depositor poap
export const assignBeaconGenesisDepositors = async () => {
  const BEACON_GENESIS_EVENT_ID = 661;
  const addresses = await getPoapOwners(BEACON_GENESIS_EVENT_ID);
  await assignCredToFcUsersByAddress('BeaconGenesisDepositor', addresses);
};

// Sync and assign cred to users who have > 1000 txs
export const assignOver1000Txs = async () => {
  const THRESHOLD = 1000;
  await indexTxCount(THRESHOLD);

  const result = await prisma.txCount.findMany({
    where: {
      txCount: {
        gt: THRESHOLD,
      },
    },
    select: {
      address: true,
    },
  });

  const addresses = result.map(({ address }) => address);
  await assignCredToFcUsersByAddress('Over1000Txs', addresses);
};

// Sync and assign cred to users who have > 10000 txs
export const assignOver10000Txs = async () => {
  const THRESHOLD = 10000;
  await indexTxCount(THRESHOLD);

  const result = await prisma.txCount.findMany({
    where: {
      txCount: {
        gt: THRESHOLD,
      },
    },
    select: {
      address: true,
    },
  });

  const addresses = result.map(({ address }) => address);
  await assignCredToFcUsersByAddress('Over10000Txs', addresses);
};

// Sync and assign cred to users who have been onchain since 2016
export const assignOnchainSince2016 = async () => {
  await syncFirstTxs();

  const result = await prisma.address.findMany({
    select: {
      address: true,
    },
    where: {
      firstTxTimestamp: {
        lte: new Date('2016-12-31T11:59:59Z'),
      },
    },
  });

  const addresses = result.map(({ address }) => address);
  await assignCredToFcUsersByAddress('OnchainSince2016', addresses);
};

// Sync and assign cred to users who deposited over 256 eth to the beacon contract
export const assignBeaconDepositOver256Eth = async () => {
  await syncBeaconDepositors();

  const result = await prisma.$queryRaw<{ address: string }[]>`
    WITH total_deposits AS (
      SELECT
        sum(cast("value" AS numeric)) / 1e18 AS total_deposit,
        address
      FROM
        "BeaconDepositEvent"
      GROUP BY
        "address"
    )
    SELECT
      "address"
    FROM
      total_deposits
    WHERE
      total_deposit > 256
  `;

  const addresses = result.map(({ address }) => address);
  await assignCredToFcUsersByAddress('BeaconDepositOver256ETH', addresses);
};

// Sync and assign cred to users who have the SuperRare OG POAP
export const assignSuperRareOgs = async () => {
  const SUPER_RARE_OG_POAP_EVENT_ID = 21860;
  const addresses = await getPoapOwners(SUPER_RARE_OG_POAP_EVENT_ID);
  await assignCredToFcUsersByAddress('SuperRareOg', addresses);
};

/**
 * NFT cred
 */

export const assignNouns = async () => {
  const NOUNS_CONTRACT_ID = 300;

  const addresses = await getERC721Owners(NOUNS_CONTRACT_ID);
  await assignCredToFcUsersByAddress('Nouns', addresses);
};

export const assignMilady = async () => {
  const MILADY_CONTRACT_ID = 302;

  const addresses = await getERC721Owners(MILADY_CONTRACT_ID);
  await assignCredToFcUsersByAddress('Milady', addresses);
};

export const assignPurple = async () => {
  const PURPLE_CONTRACT_ID = 304;

  const addresses = await getERC721Owners(PURPLE_CONTRACT_ID);
  await assignCredToFcUsersByAddress('Purple', addresses);
};

export const assignPudgyPenguins = async () => {
  const PUDGY_PENGUINS_CONTRACT_ID = 303;

  const addresses = await getERC721Owners(PUDGY_PENGUINS_CONTRACT_ID);
  await assignCredToFcUsersByAddress('PudgyPenguins', addresses);
};

export const assignAzuki = async () => {
  const AZUKI_CONTRACT_ID = 305;

  const addresses = await getERC721Owners(AZUKI_CONTRACT_ID);
  await assignCredToFcUsersByAddress('Azuki', addresses);
};

/**
 **  Add more spotlight cred here
 */

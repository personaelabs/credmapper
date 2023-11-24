import 'dotenv/config';
import {
  UserProfile,
  UserDataQueryResult,
  ConnectedAddressesQueryResults,
  DeletedAddressesQueryResults,
  GetCastsOptions,
  CastsQueryResult,
  UsernameQueryResult,
} from '../types';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../prisma';

// A client that points to the Farcaster replica database
const fcReplicaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.FARCASTER_REPLICA_DB_URL,
    },
  },
});

const userDataTypes = [
  {
    type: 'pfp',
    key: 1,
  },
  {
    type: 'displayName',
    key: 2,
  },
  {
    type: 'bio',
    key: 3,
  },
  {
    type: 'username',
    key: 6,
  },
];

// Get all users from the Farcaster replica database
const getUsers = async (): Promise<UserProfile[]> => {
  let profiles: {
    [key: number]: UserProfile;
  } = {};

  for (const { key, type } of userDataTypes) {
    const result = await fcReplicaClient.$queryRaw<UserDataQueryResult[]>`
      SELECT
        fid,
        value
      FROM
        user_data
      WHERE
        "type" = ${key}
      ORDER BY
        fid
        `;

    for (const row of result) {
      const fid = Number(row.fid);
      if (profiles[fid]) {
        profiles[fid][type] = row.value;
      } else {
        profiles[fid] = {
          fid: BigInt(fid),
          pfp: '',
          displayName: '',
          bio: '',
          username: '',
          followersCount: 0,

          // Set the actual value
          [type]: row.value,
        };
      }
    }
  }

  return Object.values(profiles) as UserProfile[];
};

// Get all connected addresses from the Farcaster replica database
export const getConnectedAddresses = async (): Promise<ConnectedAddressesQueryResults[]> => {
  const synchedFIDs = (
    await prisma.user.findMany({
      select: {
        fid: true,
      },
    })
  ).map((r) => r.fid);

  const result = await fcReplicaClient.$queryRaw<ConnectedAddressesQueryResults[]>`
    SELECT
      fid,
      ARRAY_AGG(claim) as addresses
    FROM
      verifications
    WHERE fid in (${Prisma.join(synchedFIDs)})
    and deleted_at IS NULL
    GROUP BY
      fid
  `;

  return result;
};

const getDeletedAddresses = async (): Promise<DeletedAddressesQueryResults[]> => {
  const result = await fcReplicaClient.$queryRaw<DeletedAddressesQueryResults[]>`
    SELECT
    fid,
    ARRAY_AGG(claim) as addresses
  FROM
    verifications
  WHERE
    deleted_at IS NOT NULL
  GROUP BY
    fid
  `;

  return result;
};

export const syncFcUsers = async () => {
  // Get deleted connections
  const deletedConnections = await getDeletedAddresses();

  // Delete deleted connections
  for (const connection of deletedConnections) {
    await prisma.connectedAddress.deleteMany({
      where: {
        fid: Number(connection.fid),
        address: {
          in: connection.addresses.map((r) => r.address),
        },
      },
    });
  }

  console.time('Get user profiles');
  const userProfiles = await getUsers();
  console.timeEnd('Get user profiles');

  // Get deleted users
  const deletedUsers = await prisma.user.findMany({
    where: {
      NOT: {
        fid: {
          in: userProfiles.map((r) => Number(r.fid)),
        },
      },
    },
  });

  // Delete deleted users
  const profileDeletedFIDs = deletedUsers.map((r) => r.fid);
  await prisma.user.deleteMany({
    where: {
      fid: {
        in: profileDeletedFIDs,
      },
    },
  });

  // Create users
  await prisma.user.createMany({
    data: userProfiles.map((r) => ({
      ...r,
      fid: Number(r.fid),
    })),
    skipDuplicates: true,
  });

  // Get connected addresses
  console.time('Get connected addresses');
  const connectedAddresses = await getConnectedAddresses();
  console.timeEnd('Get connected addresses');

  const data = connectedAddresses
    .map((r) => r.addresses.map((address) => ({ fid: Number(r.fid), address: address.address })))
    .flat();

  console.time('Insert connected addresses');
  await prisma.connectedAddress.createMany({
    data,
    skipDuplicates: true,
  });
  console.timeEnd('Insert connected addresses');
};

export const getCasts = async (
  options: GetCastsOptions,
): Promise<
  ({
    displayName: string;
    username: string;
  } & CastsQueryResult)[]
> => {
  const fids = Prisma.join(options.fids);

  console.time('Get casts');
  const castsQueryResult = await fcReplicaClient.$queryRaw<CastsQueryResult[]>`
      SELECT
          "timestamp",
          "text",
          "hash",
          "parent_fid",
          "fid",
          "parent_url",
          "mentions",
          "mentions_positions",
          "embeds"
      FROM
          casts
      WHERE deleted_at IS NULL
      AND fid in (${fids})
      AND "parent_hash" IS NULL
      AND "timestamp" > ${options.fromDate}
      ORDER BY
      "timestamp" DESC
   `;
  console.timeEnd('Get casts');

  console.time('Get usernames');
  const usernames = await fcReplicaClient.$queryRaw<UsernameQueryResult[]>`
      SELECT
      fid,
      "value"
      FROM
        user_data
      WHERE
      "type" = 6 AND fid in (${fids})
    `;
  console.timeEnd('Get usernames');

  console.time('Get display names');
  const displayNames = await fcReplicaClient.$queryRaw<UsernameQueryResult[]>`
      SELECT
      fid,
      "value"
      FROM
        user_data
      WHERE
      "type" = 2 AND fid in (${fids})
    `;
  console.timeEnd('Get display names');

  console.time('Map casts');
  const casts = castsQueryResult.map((cast) => ({
    ...cast,
    username: usernames.find((username) => username.fid === cast.fid)?.value || '',
    displayName: displayNames.find((displayName) => displayName.fid === cast.fid)?.value || '',
  }));
  console.timeEnd('Map casts');

  return casts;
};

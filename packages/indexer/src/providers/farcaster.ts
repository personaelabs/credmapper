import 'dotenv/config';
import {
  UserProfile,
  UserDataQueryResult,
  ConnectedAddressesQueryResults,
  GetCastsOptions,
  CastsQueryResult,
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

export const indexFcUsers = async () => {
  console.time('Get user profiles');
  const userProfiles = await getUsers();
  console.timeEnd('Get user profiles');

  // Create users
  await prisma.user.createMany({
    data: userProfiles.map((r) => ({
      ...r,
      fid: Number(r.fid),
    })),
    skipDuplicates: true,
  });
};

export const getCasts = async (options: GetCastsOptions): Promise<CastsQueryResult[]> => {
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

  return castsQueryResult;
};

export const getUserAddresses = async (): Promise<ConnectedAddressesQueryResults[]> => {
  const connectedAddresses = await fcReplicaClient.$queryRaw<ConnectedAddressesQueryResults[]>`
      SELECT
          "verified_addresses",
          "fid"
      FROM
        profile_with_addresses
   `;

  return connectedAddresses;
};

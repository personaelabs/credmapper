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
export const fcReplicaClient = new PrismaClient({
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

export const indexUsers = async () => {
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
      WITH filtered_casts AS (
        SELECT
          "id",
          "timestamp",
          "text",
          "parent_fid",
          "fid",
          "parent_url",
          "mentions",
          "mentions_positions",
          "embeds",
          "hash"
        FROM
          casts
        WHERE
          deleted_at IS NULL
          AND fid in(${fids})
          AND "parent_hash" IS NULL
          AND "timestamp" > ${options.fromDate}
        ORDER BY
          "timestamp" DESC
      ),
      with_likes AS (
        SELECT
          filtered_casts.id,
          count(CASE WHEN reaction_type = 1 THEN 1 END) AS likes_count,
          count(CASE WHEN reaction_type = 2 THEN 1 END) AS recasts_count
        FROM
          filtered_casts
          INNER JOIN reactions ON filtered_casts.hash = reactions.target_hash
        WHERE reactions.reaction_type in (1, 2) AND reactions.deleted_at IS NULL
        GROUP by filtered_casts.id
      )
      SELECT
          "timestamp",
          "text",
          "parent_fid",
          "fid",
          "parent_url",
          "mentions",
          "mentions_positions",
          "embeds",
          "filtered_casts"."hash" as "hash",
          "with_likes"."likes_count",
          "with_likes"."recasts_count"
      FROM
        filtered_casts
        INNER JOIN with_likes ON filtered_casts.id = with_likes.id
      `;
  console.timeEnd('Get casts');

  return castsQueryResult;
};

export const getUserAddresses = async (): Promise<ConnectedAddressesQueryResults[]> => {
  console.time('Get connected addresses');
  const connectedAddresses = await fcReplicaClient.$queryRaw<ConnectedAddressesQueryResults[]>`
      SELECT
          "verified_addresses",
          "fid"
      FROM
        profile_with_addresses
   `;
  console.timeEnd('Get connected addresses');

  return connectedAddresses;
};

import 'dotenv/config';
import {
  UserProfile,
  UserDataQueryResult,
  ConnectedAddressesQueryResults,
  GetCastsOptions,
  CastsQueryResult,
  UsersQueryResult,
} from '../types';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { batchRun } from '../utils';

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
  const users = await fcReplicaClient.$queryRaw<UsersQueryResult[]>`
    WITH pfps AS (
      SELECT
        fid,
        value AS pfp
      FROM
        user_data
      WHERE
        "type" = 1
    ),
    display_names AS (
      SELECT
        fid,
        value AS display_name
      FROM
        user_data
      WHERE
        "type" = 2
    ),
    bios AS (
      SELECT
        fid,
        value AS bio
      FROM
        user_data
      WHERE
        "type" = 3
    ),
    usernames AS (
      SELECT
        fid,
        value AS username
      FROM
        user_data
      WHERE
        "type" = 6
    )
    SELECT
      fids.fid, pfps.pfp, display_names.display_name, bios.bio, usernames.username
    FROM
      fids
      LEFT JOIN pfps ON pfps.fid = fids.fid
      LEFT JOIN display_names ON display_names.fid = fids.fid
      LEFT JOIN bios ON bios.fid = fids.fid
      LEFT JOIN usernames ON usernames.fid = fids.fid
  `;

  return users.map((r) => ({
    fid: r.fid,
    displayName: r.display_name,
    pfp: r.pfp,
    bio: r.bio,
    username: r.username,
    followersCount: 0,
  }));
};

export const indexUsers = async () => {
  console.time('Get user profiles');
  const userProfiles = await getUsers();
  console.timeEnd('Get user profiles');

  // Create users
  await batchRun(
    async (batch) => {
      await Promise.all(
        batch.map((userProfile) => {
          return prisma.user.upsert({
            where: {
              fid: userProfile.fid,
            },
            update: userProfile,
            create: userProfile,
          });
        }),
      );
    },
    userProfiles,
    'User',
    50,
  );
};

export const getCasts = async (options: GetCastsOptions): Promise<CastsQueryResult[]> => {
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

export const getAllAddresses = async (): Promise<ConnectedAddressesQueryResults[]> => {
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

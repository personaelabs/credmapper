import 'dotenv/config';
import {
  UserProfile,
  UserDataQueryResult,
  ConnectedAddressesQueryResults,
  GetCastsOptions,
  CastsQueryResult,
  UsersQueryResult,
  NewCastsQueryResult,
  NewReactionsQueryResult,
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

const getUsernames = async (updatedAfter: Date): Promise<UserDataQueryResult[]> => {
  const usernames = await fcReplicaClient.$queryRaw<UserDataQueryResult[]>`
    SELECT
      "value",
      "fid"
    FROM
      "user_data"
    WHERE
      "type" = 6
      AND "updated_at" > ${updatedAfter}
  `;

  return usernames;
};

const getDisplayNames = async (updatedAfter: Date): Promise<UserDataQueryResult[]> => {
  const displayNames = await fcReplicaClient.$queryRaw<UserDataQueryResult[]>`
    SELECT
      "value",
      "fid"
    FROM
      "user_data"
    WHERE
      "type" = 2
      AND "updated_at" > ${updatedAfter}
  `;

  return displayNames;
};

const getPfps = async (updatedAfter: Date): Promise<UserDataQueryResult[]> => {
  const pfps = await fcReplicaClient.$queryRaw<UserDataQueryResult[]>`
    SELECT
      "value",
      "fid"
    FROM
      "user_data"
    WHERE
      "type" = 1
      AND "updated_at" > ${updatedAfter}
  `;

  return pfps;
};

const getBios = async (updatedAfter: Date): Promise<UserDataQueryResult[]> => {
  const bios = await fcReplicaClient.$queryRaw<UserDataQueryResult[]>`
    SELECT
      "value",
      "fid"
    FROM
      "user_data"
    WHERE
      "type" = 3
      AND "updated_at" > ${updatedAfter}
  `;

  return bios;
};

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
  const tableIsEmpty = (await prisma.user.findFirst()) == null;
  if (tableIsEmpty) {
    const userProfiles = await getUsers();
    await prisma.user.createMany({
      data: userProfiles,
    });
  } else {
    const latestUpdatedAt = (
      await prisma.user.aggregate({
        _max: {
          updatedAt: true,
        },
      })
    )._max.updatedAt!;

    const buffer = 1000 * 60 * 2; // 2 minute
    const updatedAfter = new Date(new Date(latestUpdatedAt).getTime() - buffer);

    const pfps = await getPfps(updatedAfter);
    const displayNames = await getDisplayNames(updatedAfter);
    const bios = await getBios(updatedAfter);
    const usernames = await getUsernames(updatedAfter);

    const updatedFids = [
      ...new Set([
        ...pfps.map((r) => r.fid),
        ...displayNames.map((r) => r.fid),
        ...bios.map((r) => r.fid),
        ...usernames.map((r) => r.fid),
      ]),
    ];

    for (const fid of updatedFids) {
      console.time(`Update user ${fid}`);
      const userProfile: Prisma.UserUpdateInput = {};

      const pfp = pfps.find((r) => r.fid === fid);
      if (pfp) {
        userProfile.pfp = pfp.value;
      }

      const displayName = displayNames.find((r) => r.fid === fid);
      if (displayName) {
        userProfile.displayName = displayName.value;
      }

      const bio = bios.find((r) => r.fid === fid);
      if (bio) {
        userProfile.bio = bio.value;
      }

      const username = usernames.find((r) => r.fid === fid);
      if (username) {
        userProfile.username = username.value;
      }

      await prisma.user.upsert({
        where: {
          fid,
        },
        create: { fid, followersCount: 0, ...userProfile } as Prisma.UserCreateInput,
        update: userProfile,
      });
      console.timeEnd(`Update user ${fid}`);
    }
  }
};

export const getNewCasts = async (fromDate: Date): Promise<NewCastsQueryResult[]> => {
  const newCasts = await fcReplicaClient.$queryRaw<NewCastsQueryResult[]>`
    SELECT
      *
    FROM
      casts
    WHERE
      created_at >= ${fromDate}
      AND deleted_at IS NULL
  `;

  return newCasts;
};

export const getNewReactions = async (fromDate: Date): Promise<NewReactionsQueryResult[]> => {
  const newReactions = await fcReplicaClient.$queryRaw<NewReactionsQueryResult[]>`
    SELECT
    target_hash,
    reaction_type,
    fid,
    "timestamp"
    FROM
      reactions
    WHERE
      created_at > ${fromDate} AND
      deleted_at IS NULL
  `;

  return newReactions;
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

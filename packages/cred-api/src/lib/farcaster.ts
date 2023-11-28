import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { CastsQueryResult, IndexedCast } from '../types';

// A client that points to the Farcaster replica database
export const fcReplicaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.FARCASTER_REPLICA_DB_URL,
    },
  },
});

export const getCasts = async (fromDate: Date): Promise<IndexedCast[]> => {
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
          AND "timestamp" > ${fromDate}
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

  const casts = castsQueryResult.map((cast) => ({
    id: `0x${cast.hash.toString('hex')}`,
    fid: cast.fid,
    text: cast.text,
    timestamp: cast.timestamp,
    hash: `0x${cast.hash.toString('hex')}`,
    embeds: cast.embeds.map((embed) => embed.url),
    mentions: cast.mentions,
    mentionsPositions: cast.mentions_positions,
    parentUrl: cast.parent_url,
    likesCount: cast.likes_count,
    recastsCount: cast.recasts_count,
  })) as IndexedCast[];

  return casts;
};

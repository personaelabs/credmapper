import { PackagedCast, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { Cred, FeedItem, FeedQueryResult } from '../types';
import channels from '../../channels.json';
import CRED_META from '../../credMeta';

const PAGE_SIZE = 20;

const toFeed = (casts: FeedQueryResult[] | PackagesSelectResult[]): FeedItem[] => {
  if ('user' in casts[0]) {
    return (casts as PackagesSelectResult[]).map((cast) => ({
      username: cast.user.username || '',
      displayName: cast.user.displayName || '',
      pfp: cast.user.pfp || '',
      fid: cast.fid.toString(),
      text: cast.text,
      timestamp: cast.timestamp,
      embeds: cast.embeds.map((embed) => ({
        url: embed,
      })),
      cred: cast.user.UserCred.map((cred) => CRED_META.find((c) => c.id === cred.cred)).filter(
        (c) => c !== undefined,
      ) as Cred[],
      parentUrl: cast.parentUrl,
      mentions: cast.mentions.map((mention) => mention.toString()),
      likesCount: cast.likesCount.toString(),
      recastsCount: cast.recastsCount.toString(),
      repliesCount: cast.repliesCount.toString(),
      channel: channels.find((c) => c.parent_url === cast.parentUrl)!,
    }));
  } else {
    return (casts as FeedQueryResult[]).map((cast) => ({
      username: cast.username || '',
      displayName: cast.displayName || '',
      pfp: cast.pfp || '',
      fid: cast.fid.toString(),
      text: cast.text,
      timestamp: cast.timestamp,
      embeds: cast.embeds,
      cred:
        (cast.cred
          ?.map((cred) => CRED_META.find((c) => c.id === cred))
          .filter((c) => c !== undefined) as Cred[]) || [],
      parentUrl: cast.parentUrl,
      mentions: cast.mentions.map((mention) => mention.toString()),
      likesCount: cast.likesCount.toString(),
      recastsCount: cast.recastsCount.toString(),
      repliesCount: cast.repliesCount.toString(),
      channel: channels.find((c) => c.parent_url === cast.parentUrl)!,
    }));
  }
};

const PackagesSelect = {
  fid: true,
  text: true,
  timestamp: true,
  parentUrl: true,
  embeds: true,
  mentions: true,
  mentionsPositions: true,
  likesCount: true,
  recastsCount: true,
  repliesCount: true,
  user: {
    select: {
      displayName: true,
      username: true,
      pfp: true,
      UserCred: {
        select: {
          cred: true,
        },
      },
    },
  },
};

export type PackagesSelectResult = Prisma.PackagedCastGetPayload<{ select: typeof PackagesSelect }>;

export const getCredFeed = async (skip: number) => {
  const casts = await prisma.packagedCast.findMany({
    select: PackagesSelect,
    where: {
      user: {
        UserCred: {
          some: {
            NOT: {
              cred: undefined,
            },
          },
        },
      },
    },
    skip,
    take: PAGE_SIZE + 1,
    orderBy: {
      timestamp: 'desc',
    },
  });

  const hasNextPage = casts.length > PAGE_SIZE;
  const feed = toFeed(casts.slice(0, PAGE_SIZE));

  return {
    feed,
    hasNextPage,
  };
};

const CHANNEL_CRED: {
  [key: string]: string[];
} = {
  nouns: ['Nouns_owner'],
  ethereum: ['Devcon 5_owner'],
  superrare: [
    'SuperRare Artist Badge (2021)_owner',
    'SuperRare Collector Badge (2021)_owner',
    'SuperRare OG Member Badge_owner',
  ],
};

export const getChannelFeed = async (channelId: string, skip: number) => {
  const channelCred = CHANNEL_CRED[channelId];
  const channel = channels.find((c) => c.channel_id === channelId)!;
  const parentUrl = channel.parent_url;

  const casts = await prisma.$queryRaw<FeedQueryResult[]>`
    WITH with_reactions AS (
      SELECT
        "PackagedCast".id,
        count(
          CASE WHEN "reactionType" = 1 THEN
            1
          END) AS "likesCount",
        count(
          CASE WHEN "reactionType" = 2 THEN
            1
          END) AS "recastsCount",
        count(
          CASE WHEN "reactionType" = 3 THEN
            1
          END) AS "repliesCount"
      FROM
        "PackagedCast"
      LEFT JOIN "Reaction" ON "PackagedCast".id = "Reaction"."castId"
    WHERE
      "PackagedCast"."parentUrl" = ${parentUrl}
    GROUP BY
      "PackagedCast".id
    ),
    users_with_cred AS (
      SELECT
        "User".*,
        ARRAY_AGG(cred) AS cred
      FROM
        "User"
      LEFT JOIN "UserCred" ON "User".fid = "UserCred".fid
    GROUP BY
      "User".fid
    ),
    feed AS (
      SELECT
        "PackagedCast".fid,
        "PackagedCast".text,
        "PackagedCast"."timestamp",
        "PackagedCast"."mentions",
        "PackagedCast"."embeds",
        "PackagedCast"."parentUrl",
        users_with_cred."pfp",
        users_with_cred."displayName",
        users_with_cred."username",
        users_with_cred."fid",
        users_with_cred."cred",
        with_reactions."likesCount",
        with_reactions."recastsCount",
        with_reactions."repliesCount",
        (EXTRACT(EPOCH FROM now() - "PackagedCast"."timestamp")) / (60 * 60 * 24),
        (with_reactions."likesCount" + with_reactions."recastsCount" * 2 - 10 * EXTRACT(EPOCH FROM now() - "PackagedCast"."timestamp")) / (60 * 60 * 24) + (
          CASE WHEN users_with_cred.cred @> ARRAY [${Prisma.join(channelCred)}] THEN
            25
          ELSE
            0
          END) AS channel_score -- Score of the cast
      FROM
        "PackagedCast"
      LEFT JOIN users_with_cred ON users_with_cred.fid = "PackagedCast".fid
      LEFT JOIN with_reactions ON with_reactions.id = "PackagedCast".id
    WHERE
      "PackagedCast"."parentUrl" = ${parentUrl}
    LIMIT 100
    )
    SELECT
      *
    FROM
      feed
    ORDER BY
  	channel_score DESC
  `;

  const feed = toFeed(casts.slice(0, PAGE_SIZE));

  const hasNextPage = casts.length > PAGE_SIZE;

  return {
    feed,
    hasNextPage,
  };
};

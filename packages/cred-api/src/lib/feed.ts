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
  superrare: ['SuperRare Artist Badge (2021)_owner'],
};

export const getChannelFeed = async (channelId: string, skip: number) => {
  const channelCred = CHANNEL_CRED[channelId];
  const channel = channels.find((c) => c.channel_id === channelId)!;
  const parentUrl = channel.parent_url;

  const casts = await prisma.$queryRaw<FeedQueryResult[]>`
    WITH user_cred AS (
      SELECT
        fid,
        ARRAY_AGG(cred) AS cred
      FROM
        "UserCred"
      GROUP BY
        fid
    ),
    users_with_cred AS (
      SELECT
        "User".fid,
        "User"."displayName",
        "User".username,
        "User".pfp,
        "user_cred".cred
      FROM
        "User"
      LEFT JOIN user_cred ON user_cred.fid = "User".fid
    ),
    with_scores AS (
      SELECT
        users_with_cred.*,
        text,
        score,
        "parentUrl",
        "timestamp",
        "likesCount",
        "recastsCount",
        "repliesCount",
        "mentions",
        "embeds",
        score + (
          CASE WHEN users_with_cred.cred @> ARRAY [${Prisma.join(channelCred)}] THEN
            200
          ELSE
            0
          END) AS channel_score
      FROM
        "PackagedCast"
        LEFT JOIN users_with_cred ON "PackagedCast".fid = users_with_cred.fid
      WHERE
        "parentUrl" = ${parentUrl}
      ORDER BY
        channel_score DESC
      OFFSET ${skip}
      LIMIT ${PAGE_SIZE + 1}
    )
    SELECT
      "fid",
      "pfp",
      "username",
      "displayName",
      "text",
      "cred",
      "likesCount",
      "repliesCount",
      "recastsCount",
      "mentions",
      "embeds",
      "timestamp",
      "channel_score",
      "parentUrl"
    FROM
      with_scores
    ORDER BY "channel_score" DESC
  `;

  const feed = toFeed(casts.slice(0, PAGE_SIZE));

  const hasNextPage = casts.length > PAGE_SIZE;

  return {
    feed,
    hasNextPage,
  };
};

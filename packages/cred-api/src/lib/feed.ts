import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { Cred, FeedItem } from '../types';
import channels from '../../channels.json';
import CRED_META from '../../credMeta';

const PAGE_SIZE = 20;

export const castToFeedItem = (
  cast: CastWithChildrenSelectResult | CastSelectResult,
): Omit<FeedItem, 'children'> => {
  return {
    id: cast.id,
    username: cast.user.username || '',
    displayName: cast.user.displayName || '',
    pfp: cast.user.pfp || '',
    fid: cast.fid.toString(),
    text: cast.text,
    timestamp: cast.timestamp,
    embeds: cast.embeds,
    cred: cast.user.UserCred.map((cred) => CRED_META.find((c) => c.id === cred.cred)).filter(
      (c) => c !== undefined,
    ) as Cred[],
    parentUrl: cast.parentUrl,
    parentHash: cast.parentHash,
    mentions: cast.mentions.map((mention) => mention.toString()),
    channel: channels.find((c) => c.parent_url === cast.parentUrl)!,
    reactions: cast.Reaction,
    repliesCount: cast._count.children,
  };
};

export const castWithChildrenToFeedItem = (cast: CastWithChildrenSelectResult): FeedItem => {
  return {
    ...castToFeedItem(cast),
    children: cast.children.map(castToFeedItem),
  };
};

export const CastSelect = {
  id: true,
  fid: true,
  text: true,
  timestamp: true,
  parentUrl: true,
  parentHash: true,
  embeds: true,
  mentions: true,
  mentionsPositions: true,
  Reaction: {
    select: {
      reactionType: true,
    },
  },
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
      addresses: {
        select: {
          firstTxTimestamp: true,
        },
      },
    },
  },
  _count: {
    select: {
      children: true,
    },
  },
};

export const CastWithChildrenSelect = {
  ...CastSelect,
  children: {
    select: {
      ...CastSelect,
      children: false,
    },
  },
};

export type CastSelectResult = Prisma.PackagedCastGetPayload<{
  select: typeof CastSelect;
}>;

export type CastWithChildrenSelectResult = Prisma.PackagedCastGetPayload<{
  select: typeof CastWithChildrenSelect;
}>;

export const getCredFeed = async (skip: number) => {
  const casts = await prisma.packagedCast.findMany({
    select: CastWithChildrenSelect,
    where: {
      parentHash: null,
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
  const feed = casts.slice(0, PAGE_SIZE).map(castWithChildrenToFeedItem);

  return {
    feed,
    hasNextPage,
  };
};

export const getFollowingFeed = async (skip: number, username: string) => {
  // TODO
};

export const getUserFeed = async (fid: bigint, skip: number) => {
  console.log({ fid });
  const casts = await prisma.packagedCast.findMany({
    select: CastWithChildrenSelect,
    where: {
      parentHash: null,
      user: {
        fid,
      },
    },
    skip,
    take: PAGE_SIZE + 1,
    orderBy: {
      timestamp: 'desc',
    },
  });

  const hasNextPage = casts.length > PAGE_SIZE;
  const feed = casts.slice(0, PAGE_SIZE).map(castWithChildrenToFeedItem);

  return {
    feed,
    hasNextPage,
  };
};

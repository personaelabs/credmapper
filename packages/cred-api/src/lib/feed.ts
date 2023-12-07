import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { CredData, FeedItem, MentionedUser } from '../types';
import channels from '../../channels.json';
import CRED_META from '../../credMeta';
import { getMentionedUsersInCasts, insertBytes } from './utils';

const PAGE_SIZE = 20;

function insertMentions(text: string, usernames: string[], positions: number[]): string {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let bytes = encoder.encode(text);

  let offset = 0;
  for (let i = 0; i < usernames.length; i++) {
    const word = usernames[i];
    const position = positions[i];
    const encodedUsername = encoder.encode(word);
    bytes = insertBytes(bytes, encodedUsername, position + offset);
    offset += encodedUsername.length;
  }

  return decoder.decode(bytes);
}

export const castToFeedItem = <C extends CastSelectResult>(
  cast: C,
  mentionedUsers: MentionedUser[],
): Omit<FeedItem, 'children'> => {
  const usernames = cast.mentions.map(
    (mention) =>
      `@${mentionedUsers.find((user) => user.fid === mention)?.username || mention.toString()}`,
  );
  const textWithMentions = insertMentions(cast.text, usernames, cast.mentionsPositions);

  return {
    id: cast.id,
    username: cast.user.username || '',
    displayName: cast.user.displayName || '',
    pfp: cast.user.pfp || '',
    fid: cast.fid.toString(),
    text: textWithMentions,
    timestamp: cast.timestamp,
    embeds: cast.embeds,
    cred: cast.user.UserCred.map((cred) =>
      CRED_META.find((c) => c.id.toString() === cred.cred),
    ).filter((c) => c !== undefined) as CredData[],
    parentUrl: cast.parentUrl,
    parentHash: cast.parentHash,
    mentions: cast.mentions.map((mention) => mention.toString()),
    channel: channels.find((c) => c.parent_url === cast.parentUrl)!,
    reactions: cast.Reaction,
    repliesCount: cast._count.children,
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

export type CastSelectResult = Prisma.PackagedCastGetPayload<{
  select: typeof CastSelect;
}>;

const SPOTLIGHT_CRED = CRED_META.filter((c) => c.spotlight).map((c) => c.id.toString());

export const getSpotlightFeed = async (skip: number) => {
  const casts = await prisma.packagedCast.findMany({
    select: CastSelect,
    where: {
      parentHash: null,
      user: {
        UserCred: {
          some: {
            cred: {
              in: SPOTLIGHT_CRED,
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

  const mentionedUsers = await getMentionedUsersInCasts(casts);

  const hasNextPage = casts.length > PAGE_SIZE;
  const feed = casts.slice(0, PAGE_SIZE).map((cast) => castToFeedItem(cast, mentionedUsers));

  return {
    feed,
    hasNextPage,
  };
};

export const getFollowingFeed = async (skip: number, username: string) => {
  // TODO
};

export const getUserFeed = async (fid: bigint, skip: number) => {
  const casts = await prisma.packagedCast.findMany({
    select: CastSelect,
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

  const mentionedUsers = await getMentionedUsersInCasts(casts);

  const hasNextPage = casts.length > PAGE_SIZE;
  const feed = casts.slice(0, PAGE_SIZE).map((cast) => castToFeedItem(cast, mentionedUsers));

  return {
    feed,
    hasNextPage,
  };
};

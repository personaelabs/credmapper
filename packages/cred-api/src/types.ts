import { Reaction } from '@prisma/client';
import { Hex } from 'viem';

export enum Feed {
  Spotlight = 1,
  Following = 2,
}

export interface MentionedUser {
  fid: bigint;
  username: string;
}

export interface CastEmbed {
  url: string;
}

export interface CastsQueryResult {
  timestamp: Date;
  text: string;
  hash: Buffer;
  parent_fid: bigint | null;
  fid: bigint;
  parent_url: string | null;
  mentions: bigint[];
  mentions_positions: number[];
  embeds: CastEmbed[];
  likes_count: bigint;
  recasts_count: bigint;
}

export interface IndexedCast {
  id: Hex;
  fid: bigint;
  text: string;
  hash: Hex;
  timestamp: Date;
  username: string;
  displayName: string;
  embeds: string[];
  parentUrl: string | null;
  mentions: bigint[];
  mentionsPositions: number[];
  likesCount: bigint;
  recastsCount: bigint;
  repliesCount: bigint;
}

export interface GetFeedQueryParams {
  feed: Feed;
  offset?: string;
}

export interface GetCredFeedQueryParams {
  cred: Cred;
  offset?: string;
}

export interface GetUserFeedQueryParams {
  fid: string;
  offset?: string;
}

export interface GetCredUsersQueryParams {
  cred: Cred;
}

export interface GetAccountQueryParams {
  custodyAddress: string;
}

export interface CreateSignerResponse {
  public_key: string;
  signer_uuid: string;
}

export interface RegisterSignedKeyResponse {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url: string;
  fid: string;
}

export interface GetSignerResponse {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url: string;
  fid: string;
}

export interface GetUserResponse {
  result: {
    user: {
      // There are other fields as well,
      // but we only care about these two fields for now
      followerCount: number;
      followingCount: number;
    };
  };
}

export interface FeedQueryResult {
  id: string;
  fid: bigint;
  displayName: string | null;
  username: string | null;
  pfp: string | null;
  text: string;
  timestamp: Date;
  likesCount: bigint;
  recastsCount: bigint;
  repliesCount: bigint;
  cred: string[];
  mentions: string[];
  embeds: CastEmbed[];
  channel_score: bigint;
  parentUrl: string | null;
}

export interface Channel {
  name: string;
  parent_url: string;
  channel_id: string;
  image: string;
}

export interface CredData {
  id: string;
  name: string;
  image: string;
}

export type Cred =
  | 'OnchainSince2016'
  | 'BeaconDepositOver256ETH'
  | 'BeaconGenesisDepositor'
  | 'Over10000Txs'
  | 'SuperRareOg'
  | 'Nouns'
  | 'Milady'
  | 'Purple'
  | 'PudgyPenguins'
  | 'Azuki';
export interface FeedItem {
  id: string;
  fid: string;
  parentHash: string | null;
  displayName: string;
  username: string;
  pfp: string;
  text: string;
  timestamp: Date;
  cred: CredData[];
  mentions: string[];
  embeds: string[];
  parentUrl: string | null;
  channel: Channel;
  reactions: Pick<Reaction, 'reactionType'>[];
  repliesCount: number;
  children: Omit<FeedItem, 'children'>[];
}

export interface CredMeta {
  id: Cred;
  name: string;
  image: string;
  spotlight: boolean;
}

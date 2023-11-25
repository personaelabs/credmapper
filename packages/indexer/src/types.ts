import { Chain } from '@prisma/client';
import { AbiEvent } from 'abitype';
import { Hex } from 'viem';

export interface UserProfile {
  [key: string]: any;
  fid: bigint;
  pfp: string;
  displayName: string;
  bio: string;
  username: string;
  followersCount: number;
}

export interface UserDataQueryResult {
  fid: bigint;
  value: string;
}

export interface ConnectedAddressesQueryResults {
  fid: bigint;
  verified_addresses: string[];
}

export interface MergeMessageBody {
  message: {
    data: {
      type: string;
      fid: number;
      timestamp: number;
      network: string;
    };
  };
}

export interface MergeUsernameProofBody {
  usernameProof: {
    timestamp: number;
    name: string;
    fid: number;
    type: string;
  };
}

export interface LensUsersQueryResult {
  profile_id: string;
  addresses: Hex[];
}

export interface GetCastsOptions {
  fids: bigint[];
  fromDate: Date;
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

export interface UsernameQueryResult {
  fid: bigint;
  value: string;
}

export interface SyncPackagedCredOptions {
  cred: string;
  credibleAddresses: Hex[];
  fromDate: Date;
}

export interface ParsedLensPost {
  publicationUrl: string;
}

export interface IndexedCast {
  fid: bigint;
  text: string;
  timestamp: Date;
  hash: Hex;
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

export interface GetLensPostQueryResult {
  publication_id: string;
  profile_id: string;
  content_uri: string;
  block_timestamp: Date;
  tx_hash: string;
}

export interface LensPostData {
  lens: {
    content: string;
    attachments?: {
      item: string;
      type: string;
    }[];
  };
}

export interface GetLensPostsOptions {
  profileIds: string[];
  startDate: Date;
  endDate: Date;
}

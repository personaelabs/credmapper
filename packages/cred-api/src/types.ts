import { Hex } from 'viem';

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
  channelId?: string;
  cred?: string;
  offset?: string;
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
      fid: number;
      username: string;
      custodyAddress: string;
      displayName: string;
      pfp: {
        url: string;
      };
      profile: {
        bio: {
          text: string;
          mentionedProfiles: string[];
        };
      };
      followerCount: number;
      followingCount: number;
      verifications: string[];
      activeStatus: string;
    };
  };
}

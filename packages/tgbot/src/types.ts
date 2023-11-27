export interface GetFeedQueryParams {
  channelId?: string;
  cred?: string;
  offset?: string;
}

export interface GetAccountQueryParams {
  custodyAddress: string;
}

export interface IndexedCast {
  text: string;
  timestamp: Date;
  address: string;
  hash: string;
  username: string;
  ogpImage: string;
  images: string[];
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

export interface FeedItemData {
  text: string;
  timestamp: string;
  mentions: string[];
  embeds: string[];
  mentionsPositions: number[];
  likesCount: number;
  recastsCount: number;
  user: {
    displayName: string;
    username: string;
    pfp: string;
    UserCred: {
      cred: string;
    }[];
  };
  channel?: {
    image: string;
    name: string;
  };
}

export interface FetchOptions {
  cred?: string;
  channelId?: string;
}

export interface Account {
  displayName: string;
  username: string;
  pfp: string;
  UserCred: {
    cred: string;
  }[];
  addresses: string[];
}

export interface RegisterSignedKeyResponse {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url: string;
  fid: string;
}

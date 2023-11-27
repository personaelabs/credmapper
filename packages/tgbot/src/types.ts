export interface GetFeedQueryParams {
  channelId?: string;
  cred?: string;
  offset?: string;
}

export interface GetAccountQueryParams {
  fid: string;
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

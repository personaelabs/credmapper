import { Hex } from 'viem';

export interface UserProfile {
  fid: string;
  pfp: string | null;
  displayName: string | null;
  bio: string | null;
  url: string | null;
  username: string | null;
  ens: string | null;
  ensAddress: string | null;
  followers: string | null;
}

export interface VerificationsByFidResponse {
  messages: {
    data: {
      type: string;
      verificationAddEthAddressBody: {
        address: Hex;
      };
    };
  }[];
}

export interface FidsResponse {
  fids: number[];
  nextPageToken?: string;
}

export interface DuneTransactionRow {
  to: string;
  from: string;
}

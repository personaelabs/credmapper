import { Chain } from '@prisma/client';
import { Hex } from 'viem';

export interface UserProfile {
  fid: string;
  pfp: string | null;
  displayName: string | null;
  bio: string | null;
  username: string | null;
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

export interface ZoraNFTMetadata {
  name?: string;
  description?: string;
  image?: string;
}

export interface ZoraDrop {
  name: string;
  image: string;
  contractAddress: string;
}

// Mint of a Drop or an Edition
export interface Mint {
  contractAddress: Hex;
  minter: Hex;
  tokenId?: string;
  title: string;
  image: string;
  chain: Chain;
}

export interface IndexedRecord {
  fid: string;
  username: string;
  bio: string;
  displayName: string;
  pfp: string;
  mints: Mint[];
}

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

export interface HubEvent {
  type: string;
  id: number;
  mergeMessageBody?: MergeMessageBody;
  mergeUsernameProofBody?: MergeUsernameProofBody;
}

export interface HubEventsResponse {
  nextPageEventId: number;
  events: HubEvent[];
}

export interface DuneTransactionRow {
  to: string;
  from: string;
}

export interface ZoraNFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
}

export interface ERC721Metadata {
  contractAddress: string;
  name: string;
  chain: Chain;
}

export interface ZoraNFT extends ZoraNFTMetadata {
  contractAddress: string;
  tokenId: bigint | string;
}

export interface ZoraDrop {
  name: string;
  image: string;
  contractAddress: string;
}

// Mint of a Drop or an Edition
export interface Mint {
  title: string;
}

export interface IndexedRecord {
  fid: string;
  username: string;
  displayName: string;
  pfp: string;
  mints: Mint[];
}

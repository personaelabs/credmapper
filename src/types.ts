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
  addresses: {
    address: string;
  }[];
}

export interface DeletedAddressesQueryResults {
  fid: bigint;
  addresses: {
    address: string;
  }[];
}

export interface UsersQueryResult {
  fid: bigint;
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

export interface CryptoKittyUser {
  fid: number;
  address: string;
  username: string;
  displayName: string;
  pfp: string;
}

export interface ContractEventInfo {
  address: Hex;
  chain: Chain;
  name: string;
  deployedBlock: number;
  event: AbiEvent;
}

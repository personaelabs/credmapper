import { AbiEvent } from 'abitype';
import { Hex, Chain } from 'viem';

export interface UserProfile {
  fid: bigint;
  pfp: string;
  displayName: string;
  bio: string;
  username: string;
  followersCount: number;
}

export interface UsersQueryResult {
  fid: bigint;
  pfp: string;
  display_name: string;
  bio: string;
  username: string;
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
  parent_hash: Buffer | null;
  root_parent_hash: Buffer | null;
  fid: bigint;
  parent_url: string | null;
  mentions: bigint[];
  mentions_positions: number[];
  embeds: CastEmbed[];
}

export type NewCastsQueryResult = Omit<Omit<CastsQueryResult, 'likes_count'>, 'recasts_count'>;

export interface NewReactionsQueryResult {
  target_hash: Buffer;
  reaction_type: number;
  timestamp: Date;
  fid: bigint;
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

export interface ContractEventInfo {
  address: Hex;
  chain: Chain;
  name: string;
  deployedBlock: number;
  event: AbiEvent;
}

export interface ERC20TokenHoldingsQueryResult {
  total_value_in: number;
  total_value_out: number;
  address: string;
}

export interface TxListResponse {
  status: string;
  message: string;
  result: {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
  }[];
}

export interface ContractWithDeployedBlock {
  id: number;
  name?: string;
  address: Hex;
  deployedBlock: bigint;
  indexed?: boolean;
  type: ContractType;
}

export interface QueryTransfersResult {
  total_value_in: number;
  total_value_out: number;
  address: string;
  holding: bigint;
}

export interface MarketCapDuration {
  startDate: Date;
  endDate: Date;
}

export interface IndexedCoin {
  id: string;
  contract: string;
  deployedBlock: bigint;
  marketCapDurations: MarketCapDuration[];
  dbId: number;
  totalSupply?: string;
}

export type Cred =
  | 'OnchainSince2016'
  | 'BeaconDepositOver256ETH'
  | 'BeaconGenesisDepositor'
  | 'Over1000Txs'
  | 'Over10000Txs'
  | 'SuperRareOg'
  | 'Nouns'
  | 'Milady'
  | 'Purple'
  | 'PudgyPenguins'
  | 'Azuki';

export enum ContractType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  Other = 'Other',
}

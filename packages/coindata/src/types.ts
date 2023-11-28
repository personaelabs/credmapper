export interface CoinListResponse {
  id: string;
  symbol: string;
  name: string;
  platforms?: {
    [key: string]: string;
  };
}
[];

export interface QueryTransfersResult {
  total_value_in: number;
  total_value_out: number;
  address: string;
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
}

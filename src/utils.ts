import { Chain as DBChain } from '@prisma/client';
import { Chain } from 'viem';
import * as _chains from 'viem/chains';

const PGN: Chain = {
  name: 'Public Goods Network',
  id: 424,
  rpcUrls: {
    default: {
      http: ['https://rpc.publicgoods.network'],
    },
    public: {
      http: ['https://rpc.publicgoods.network'],
    },
  },
  network: 'mainnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18, // TODO: check
  },
};

export const chains = {
  ..._chains,
  PGN,
};

export const ToDBChain = (chain: Chain): DBChain => {
  switch (chain) {
    case chains.base:
      return DBChain.Base;
    case chains.mainnet:
      return DBChain.Ethereum;
    case chains.optimism:
      return DBChain.Optimism;
    case chains.zora:
      return DBChain.Zora;
    case chains.base:
      return DBChain.Zora;
  }

  throw new Error(`Unknown chain ${chain}`);
};

export const ToViemChain = (chain: DBChain): Chain => {
  switch (chain) {
    case DBChain.Base:
      return chains.base;
    case DBChain.Ethereum:
      return chains.mainnet;
    case DBChain.Optimism:
      return chains.optimism;
    case DBChain.Zora:
      return chains.zora;
  }

  throw new Error(`Unknown chain ${chain}`);
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(fn: () => Promise<T>, retries = 5, interval = 1000): Promise<T> => {
  let retried = 0;
  let error: any;
  while (true) {
    try {
      return await fn();
    } catch (_err: any) {
      if (retried >= retries) {
        error = _err;
        break;
      } else {
        retried++;
        await sleep(interval);
      }
    }
  }

  throw error;
};

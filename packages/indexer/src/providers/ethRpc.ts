import 'dotenv/config';
import { createPublicClient, http, Chain } from 'viem';
import * as chains from 'viem/chains';

export const getClient = (chain: Chain) => {
  switch (chain) {
    case chains.mainnet:
      return createPublicClient({
        chain: chains.mainnet,
        transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
      });
    default:
      throw new Error('Invalid chain');
  }
};

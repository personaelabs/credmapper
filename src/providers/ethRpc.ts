import 'dotenv/config';
import { PublicClient, Transport, createPublicClient, http, Chain, HttpTransport } from 'viem';
import * as chains from 'viem/chains';
import { Chain as DBChain } from '@prisma/client';

export const getClient = (chain: DBChain) => {
  switch (chain) {
    case DBChain.Ethereum:
      return createPublicClient({
        chain: chains.mainnet,
        transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
      });
    case DBChain.Zora:
      return createPublicClient({
        chain: chains.zora,
        transport: http('https://rpc.zora.energy'),
      });
    default:
      throw new Error('Invalid chain');
  }
};

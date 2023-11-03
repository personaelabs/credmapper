import { Chain, createPublicClient, http } from 'viem';
import { chains } from '../utils';

const getAlchemyUrl = (chain: string) =>
  `https://${chain}.g.alchemy.com/v2/${process.env[chain + '_ALCHEMY_API_KEY']}`;

export const getClient = (chain: Chain) => {
  let rpcUrl;
  switch (chain) {
    case chains.zora:
      rpcUrl = 'https://rpc.zora.energy';
      break;
    case chains.mainnet:
      rpcUrl = getAlchemyUrl('eth-mainnet');
      break;
    case chains.optimism:
      rpcUrl = getAlchemyUrl('opt-mainnet');
      break;
    case chains.base:
      rpcUrl = getAlchemyUrl('base-mainnet');
      break;
  }

  if (!rpcUrl) {
    throw new Error(`Unknown chain ${chain}`);
  }

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  return client;
};

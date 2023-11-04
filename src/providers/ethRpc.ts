import 'dotenv/config';
import { Chain, createPublicClient, http } from 'viem';

export const getClient = (chain: Chain) => {
  const rpcUrl = 'https://rpc.zora.energy';

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  return client;
};

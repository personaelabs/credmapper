import 'dotenv/config';
import { createPublicClient, http } from 'viem';
import { normalize } from 'viem/ens';
import { chains } from '../utils';

const publicClient = createPublicClient({
  chain: chains.mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

// Get ENS address of a given ENS name
export const getEnsAddress = async (ensName: string): Promise<string> => {
  const result = await publicClient.getEnsAddress({
    name: normalize(ensName),
  });

  return result as string;
};

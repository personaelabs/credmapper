import 'dotenv/config';
import { createPublicClient, http } from 'viem';
import * as chains from 'viem/chains';

const client = createPublicClient({
  chain: chains.mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export default client;

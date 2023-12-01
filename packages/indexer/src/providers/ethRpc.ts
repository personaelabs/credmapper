import 'dotenv/config';
import { createPublicClient, http, Chain } from 'viem';
import * as chains from 'viem/chains';

export const NUM_MAINNET_CLIENTS = 10;

export const getClient = (chain: Chain, clientIndex: number = 0) => {
  let apiKey;
  let subdomain;
  switch (chain) {
    case chains.mainnet:
      switch (clientIndex) {
        case 0:
          apiKey = process.env.ALCHEMY_API_KEY_0;
          break;
        case 1:
          apiKey = process.env.ALCHEMY_API_KEY_1;
          break;
        case 2:
          apiKey = process.env.ALCHEMY_API_KEY_2;
          break;
        case 3:
          apiKey = process.env.ALCHEMY_API_KEY_3;
          break;
        case 4:
          apiKey = process.env.ALCHEMY_API_KEY_4;
          break;
        case 5:
          apiKey = process.env.ALCHEMY_API_KEY_5;
          break;
        case 6:
          apiKey = process.env.ALCHEMY_API_KEY_6;
          break;
        case 7:
          apiKey = process.env.ALCHEMY_API_KEY_7;
          break;
        case 8:
          apiKey = process.env.ALCHEMY_API_KEY_8;
          break;
        case 9:
          apiKey = process.env.ALCHEMY_API_KEY_9;
          break;
        default:
          throw new Error('Invalid client index');
      }
      subdomain = 'eth-mainnet';
      break;
    case chains.optimism:
      apiKey = process.env.ALCHEMY_OPT_API_KEY;
      subdomain = 'opt-mainnet';
      break;
    case chains.base:
      apiKey = process.env.ALCHEMY_BASE_API_KEY;
      subdomain = 'base-mainnet';
      break;
    default:
      throw new Error('Invalid chain');
  }

  return createPublicClient({
    chain,
    transport: http(`https://${subdomain}.g.alchemy.com/v2/${apiKey}`),
  });
};

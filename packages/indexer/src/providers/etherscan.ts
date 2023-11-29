import 'dotenv/config';
import axios from 'axios';
import * as chains from 'viem/chains';
import { Chain } from 'viem';

const etherscan = (network: Chain) => {
  let baseURL, apikey;
  switch (network) {
    case chains.mainnet:
      baseURL = 'https://api.etherscan.io/api';
      apikey = process.env.ETHERSCAN_API_KEY;
      break;
    case chains.optimism:
      baseURL = 'https://api-optimistic.etherscan.io/api';
      apikey = process.env.OP_ETHERSCAN_API_KEY;
      break;
    default:
      throw new Error('Invalid network');
  }

  return axios.create({
    baseURL,
    params: {
      apikey,
    },
  });
};

export default etherscan;

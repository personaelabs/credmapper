import 'dotenv/config';
import axios from 'axios';
import { Network } from 'alchemy-sdk';

const etherscan = (network: Network) => {
  let baseURL, apikey;
  switch (network) {
    case Network.ETH_MAINNET:
      baseURL = 'https://api.etherscan.io/api';
      apikey = process.env.ETHERSCAN_API_KEY;
      break;
    case Network.OPT_MAINNET:
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

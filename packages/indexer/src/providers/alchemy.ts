import { Alchemy, Network } from 'alchemy-sdk';

const alchemy = (network: Network) => {
  let apiKey;
  switch (network) {
    case Network.ETH_MAINNET:
      apiKey = process.env.ALCHEMY_API_KEY;
      break;
    case Network.OPT_MAINNET:
      apiKey = process.env.ALCHEMY_OPT_API_KEY;
      break;
    case Network.BASE_MAINNET:
      apiKey = process.env.ALCHEMY_BASE_API_KEY;
      break;
    default:
      throw new Error('Invalid network');
  }

  return new Alchemy({
    apiKey,
    network,
  });
};

export default alchemy;

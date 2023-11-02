import 'dotenv/config';
import { Network, Alchemy } from 'alchemy-sdk';

 const alchemy = (network: Network): Alchemy => {
  const apiKey = process.env[`${network}_ALCHEMY_API_KEY`];
  return new Alchemy({
    apiKey,
    network,
  });
};

export default alchemy;
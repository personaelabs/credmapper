import 'dotenv/config';
import axios from 'axios';
import { Hex } from 'viem';

const apikey = process.env.ETHERSCAN_API_KEY;
const baseURL = 'https://api.etherscan.io/api';

const etherscan = axios.create({
  baseURL,
  params: {
    apikey,
  },
});

export const getContractDeploymentTx = async (address: string): Promise<Hex> => {
  const response = await etherscan.get('', {
    params: {
      module: 'contract',
      action: 'getcontractcreation',
      contractaddresses: address,
    },
  });

  const deploymentTx = response.data.result[0];

  return deploymentTx.txHash;
};

export default etherscan;

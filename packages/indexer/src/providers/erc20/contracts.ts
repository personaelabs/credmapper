import { Hex } from 'viem';
import { ContractWithDeployedBlock } from '../../types';
import indexedCoins from './indexedCoins.json';

const CONTRACTS: ContractWithDeployedBlock[] = indexedCoins.map((coin) => ({
  address: coin.contract as Hex,
  deployedBlock: BigInt(coin.deployedBlock),
}));

export default CONTRACTS;

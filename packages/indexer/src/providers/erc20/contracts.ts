import { Hex } from 'viem';
import { ContractWithDeployedBlock } from '../../types';
import indexedCoins from './indexedCoins.json';

const CONTRACTS: ContractWithDeployedBlock[] = [
  ...indexedCoins.map((coin) => ({
    id: coin.dbId,
    name: coin.id,
    address: coin.contract as Hex,
    deployedBlock: BigInt(coin.deployedBlock),
  })),
  {
    id: indexedCoins.length + 1,
    name: 'Lido',
    address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    deployedBlock: BigInt(11473216),
  },
];

export default CONTRACTS;

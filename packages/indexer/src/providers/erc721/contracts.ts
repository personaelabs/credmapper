import { ContractWithDeployedBlock } from '../../types';

const CONTRACTS: ContractWithDeployedBlock[] = [
  {
    id: 300,
    name: 'Nouns',
    address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
    deployedBlock: BigInt(12985438),
    indexed: true,
  },
  {
    id: 302,
    name: 'Milady',
    address: '0x5af0d9827e0c53e4799bb226655a1de152a425a5',
    deployedBlock: BigInt(13090020),
    indexed: true,
  },
  {
    id: 303,
    name: 'Pudgy Penguins',
    address: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8',
    deployedBlock: BigInt(12876179),
    indexed: true,
  },
];

export default CONTRACTS;

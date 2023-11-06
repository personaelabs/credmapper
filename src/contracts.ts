import { Chain } from '@prisma/client';
import { Hex } from 'viem';

const contracts: {
  name: string;
  address: Hex;
  deployedBlock: number;
  chain: Chain;
}[] = [
  {
    name: 'Zorbs',
    address: '0xca21d4228cdcc68d4e23807e5e370c07577dd152',
    deployedBlock: 13917151,
    chain: Chain.Ethereum,
  },
  {
    name: 'Opepen',
    address: '0x6339e5e072086621540d0362c4e3cea0d643e114',
    deployedBlock: 16364123,
    chain: Chain.Ethereum,
  },
  {
    name: 'Stand with crypto',
    address: '0x9d90669665607f08005cae4a7098143f554c59ef',
    deployedBlock: 16900497,
    chain: Chain.Ethereum,
  },
];

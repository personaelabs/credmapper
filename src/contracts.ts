import { Chain } from '@prisma/client';
import { AbiEvent } from 'abitype';
import { Hex } from 'viem';
import { TRANSFER_EVENT } from './providers/721';
import { ContractEventInfo } from './types';

export const CRYPTO_KITTIES_TRANSFER_EVENT = {
  ...TRANSFER_EVENT,
  // The args of the `Transfer` event in the CryptoKitties contract aren't indexed.
  inputs: TRANSFER_EVENT.inputs.map((input) => ({
    ...input,
    indexed: false,
  })),
};

export const CRYPTO_KITTIES_CONTRACT: ContractEventInfo = {
  name: 'CryptoKitties',
  address: '0x06012c8cf97bead5deae237070f9587f8e7a266d',
  deployedBlock: 4605167,
  chain: Chain.Ethereum,
  event: CRYPTO_KITTIES_TRANSFER_EVENT,
};

const contracts: ContractEventInfo[] = [
  {
    name: 'Zorbs',
    address: '0xca21d4228cdcc68d4e23807e5e370c07577dd152',
    deployedBlock: 13917151,
    chain: Chain.Ethereum,
    event: TRANSFER_EVENT,
  },
  {
    name: 'Opepen',
    address: '0x6339e5e072086621540d0362c4e3cea0d643e114',
    deployedBlock: 16364123,
    chain: Chain.Ethereum,
    event: TRANSFER_EVENT,
  },
  {
    name: 'Stand with crypto',
    address: '0x9d90669665607f08005cae4a7098143f554c59ef',
    deployedBlock: 16900497,
    chain: Chain.Ethereum,
    event: TRANSFER_EVENT,
  },
  {
    name: 'Art Blocks',
    address: '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a',
    deployedBlock: 11338811,
    chain: Chain.Ethereum,
    event: TRANSFER_EVENT,
  },
  {
    name: 'SuperRare',
    address: '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0',
    deployedBlock: 8486734,
    chain: Chain.Ethereum,
    event: TRANSFER_EVENT,
  },
];

export default contracts;

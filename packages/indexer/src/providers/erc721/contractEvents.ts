import * as chains from 'viem/chains';
import { ContractEventInfo } from '../../types';
import { TRANSFER_EVENT } from './abi/abi';

const CONTRACT_EVENTS: ContractEventInfo[] = [
  {
    name: 'Nouns',
    address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
    deployedBlock: 12985438,
    chain: chains.mainnet,
    event: TRANSFER_EVENT,
  },
  /*
  {
    name: 'Zorbs',
    address: '0xca21d4228cdcc68d4e23807e5e370c07577dd152',
    deployedBlock: 13917151,
    chain: chains.mainnet,
    event: TRANSFER_EVENT,
  },
  {
    name: 'Opepen',
    address: '0x6339e5e072086621540d0362c4e3cea0d643e114',
    deployedBlock: 16364123,
    chain: chains.mainnet,
    event: TRANSFER_EVENT,
  },
  {
    name: 'Stand with crypto',
    address: '0x9d90669665607f08005cae4a7098143f554c59ef',
    deployedBlock: 16900497,
    chain: chains.mainnet,
    event: TRANSFER_EVENT,
  },
  {
    name: 'Art Blocks',
    address: '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a',
    deployedBlock: 11338811,
    chain: chains.mainnet,
    event: TRANSFER_EVENT,
  },
  {
    name: 'SuperRare',
    address: '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0',
    deployedBlock: 8486734,
    chain: chains.mainnet,
    event: TRANSFER_EVENT,
  },
  */
];

export default CONTRACT_EVENTS;

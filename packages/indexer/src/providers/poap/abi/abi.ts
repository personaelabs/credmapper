import { AbiEvent } from 'abitype';
import POAP from './POAP.json';

export const EVENT_TOKEN_EVENT = POAP.find((abi) => abi.name === 'EventToken') as AbiEvent;
export const TRANSFER_EVENT = POAP.find((abi) => abi.name === 'Transfer') as AbiEvent;

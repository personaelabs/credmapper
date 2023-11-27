import { AbiEvent } from 'abitype';
import BeaconDepositContract from './BeaconDepositContract.json';

export const DEPOSIT_EVENT = BeaconDepositContract.find(
  (abi) => abi.name === 'DepositEvent',
) as AbiEvent;

import { Hex } from 'viem';
import { sync721Tokens, syncTransferEvents } from './providers/721';
import { Chain } from '@prisma/client';
import { TRANSFER_EVENT } from './providers/721';
import { syncUsers } from './providers/farcaster';

const CRYPTO_KITTIES_TRANSFER_EVENT = {
  ...TRANSFER_EVENT,
  // The args of the `Transfer` event in the CryptoKitties contract aren't indexed.
  inputs: TRANSFER_EVENT.inputs.map((input) => ({
    ...input,
    indexed: false,
  })),
};

const contracts: Hex[] = [
  '0xca21d4228cdcc68d4e23807e5e370c07577dd152', // Zorbs
  '0x6339e5e072086621540d0362c4e3cea0d643e114', // Opepen Edition
  '0x9d90669665607f08005cae4a7098143f554c59ef', // Stand with crypto
];

const syncEthereum = async () => {
  const chain = Chain.Ethereum;

  await syncTransferEvents(chain, contracts, TRANSFER_EVENT);

  await syncTransferEvents(
    chain,
    ['0x06012c8cf97bead5deae237070f9587f8e7a266d'],
    CRYPTO_KITTIES_TRANSFER_EVENT,
  );

  await sync721Tokens(chain);
};

const sync = async () => {
  console.time('Sync time');

  await syncUsers();
  await syncEthereum();

  console.timeEnd('Sync time');
};

sync();

import { sync721Tokens, syncTransferEvents } from './providers/721';
import { Chain } from '@prisma/client';
import { TRANSFER_EVENT } from './providers/721';
import { syncUsers } from './providers/farcaster';
import contracts, { SUPERARE_CONTRACT, SUPERARE_CONTRACT_TRANSFER_EVENT } from './contracts';
import { CRYPTO_KITTIES_TRANSFER_EVENT, CRYPTO_KITTIES_CONTRACT } from './contracts';
import prisma from './prisma';
import { bigIntMin } from './utils';
import { syncMirrorPosts } from './providers/mirror';

const syncCryptoKittyTransfers = async () => {
  const chain = Chain.Ethereum;

  const latestEvent = await prisma.transferEvent.findFirst({
    where: {
      contractAddress: CRYPTO_KITTIES_CONTRACT.address,
    },
    orderBy: {
      blockNumber: 'asc',
    },
    select: {
      blockNumber: true,
    },
  });

  const fromBlock = BigInt(latestEvent?.blockNumber || CRYPTO_KITTIES_CONTRACT.deployedBlock);

  await syncTransferEvents(
    chain,
    [CRYPTO_KITTIES_CONTRACT.address],
    CRYPTO_KITTIES_TRANSFER_EVENT,
    fromBlock,
  );
};

const syncSupeRareTransfers = async () => {
  const chain = Chain.Ethereum;

  const latestEvent = await prisma.transferEvent.findFirst({
    where: {
      contractAddress: SUPERARE_CONTRACT.address,
    },
    orderBy: {
      blockNumber: 'asc',
    },
    select: {
      blockNumber: true,
    },
  });

  const fromBlock = BigInt(latestEvent?.blockNumber || SUPERARE_CONTRACT.deployedBlock);

  await syncTransferEvents(
    chain,
    [SUPERARE_CONTRACT.address],
    SUPERARE_CONTRACT_TRANSFER_EVENT,
    fromBlock,
  );
};

const syncERC721Transfers = async () => {
  const chain = Chain.Ethereum;

  // 1. Determine what block height to start syncing from.

  // Get the latest synched block number for each contract.
  const latestEvents = await prisma.transferEvent.groupBy({
    by: ['contractAddress'],
    _max: {
      blockNumber: true,
    },
    where: {
      chain,
    },
  });

  const synchedContracts = latestEvents.map((event) => event.contractAddress);

  // Get the contracts that have never been synced.
  const unsynchedContracts = contracts.filter(
    (contract) => !synchedContracts.includes(contract.address),
  );

  // Get the smallest block number from `unsynchedContracts` and `latestEvents`.
  const fromBlock = bigIntMin(
    ...unsynchedContracts.map((contract) => BigInt(contract.deployedBlock)),
    ...latestEvents.map((event) => event._max.blockNumber as bigint),
  );

  // Sync all transfer events
  await syncTransferEvents(
    chain,
    contracts.map((contract) => contract.address),
    TRANSFER_EVENT,
    fromBlock,
  );

  await sync721Tokens(chain);
};

const sync = async () => {
  console.time('Sync time');

  await syncUsers();
  await syncSupeRareTransfers();
  await syncCryptoKittyTransfers();
  await syncERC721Transfers();
  await syncMirrorPosts();

  console.timeEnd('Sync time');
};

sync();

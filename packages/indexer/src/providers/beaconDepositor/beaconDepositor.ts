import { BeaconDepositEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import { DEPOSIT_EVENT } from './abi/abi';
import { getClient } from '../ethRpc';
import { ContractWithDeployedBlock } from '../../types';

const FIRST_DEPOSIT_AT = BigInt(11184900); // A little before the first deposit event
const BEACON_CONTRACT: ContractWithDeployedBlock = {
  id: 301,
  address: '0x00000000219ab540356cbb839cbe05303d7705fa',
  deployedBlock: FIRST_DEPOSIT_AT,
};

export const indexBeaconDepositors = async () => {
  const client = getClient(chains.mainnet);
  const processor = async (logs: GetFilterLogsReturnType) => {
    const data = (
      await Promise.all(
        logs.map(async (log) => {
          const tx = await client.getTransaction({
            hash: log.transactionHash,
          });

          const transactionIndex = log.transactionIndex;
          const logIndex = log.logIndex;

          if (tx) {
            return {
              address: tx.from.toLowerCase() as Hex,
              blockNumber: log.blockNumber,
              value: tx.value.toString(),
              transactionIndex,
              logIndex,
            } as BeaconDepositEvent;
          } else {
            return false;
          }
        }),
      )
    ).filter((data) => data) as BeaconDepositEvent[];

    await prisma.beaconDepositEvent.createMany({
      data,
      skipDuplicates: true,
    });
  };

  const latestEvent = await prisma.beaconDepositEvent.aggregate({
    _max: {
      blockNumber: true,
    },
  });

  await processLogs(
    client,
    DEPOSIT_EVENT,
    latestEvent?._max.blockNumber || FIRST_DEPOSIT_AT,
    processor,
    BEACON_CONTRACT,
    BigInt(100),
  );
};

export const syncBeaconDepositors = async () => {
  const latestEvent = await prisma.beaconDepositEvent.aggregate({
    _max: {
      blockNumber: true,
    },
  });

  const latestBlock = await getClient(chains.mainnet).getBlockNumber();

  const syncedBlock = latestEvent?._max.blockNumber || FIRST_DEPOSIT_AT;
  if (syncedBlock > latestBlock - BigInt(10000)) {
    await indexBeaconDepositors();
  } else {
    console.log(
      `Skipping beacon depositors sync. Latest block: ${latestBlock} Synced block: ${syncedBlock}`,
    );
  }
};

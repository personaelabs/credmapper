import { BeaconDepositEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import { DEPOSIT_EVENT } from './abi/abi';
import { getClient } from '../ethRpc';
import ALL_CONTRACTS from '../../contracts/allContracts';

const BEACON_CONTRACT = ALL_CONTRACTS.find(
  (contract) => contract.address === '0x00000000219ab540356cbb839cbe05303d7705fa',
)!;

export const syncBeaconDepositors = async () => {
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
    latestEvent?._max.blockNumber || BEACON_CONTRACT.deployedBlock,
    processor,
    BEACON_CONTRACT,
    BigInt(100),
  );
};

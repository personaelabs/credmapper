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
  address: '0x00000000219ab540356cbb839cbe05303d7705fa',
  deployedBlock: FIRST_DEPOSIT_AT,
};

// Sync `Transfer` events from ERC721 contracts
export const indexBeaconDepositors = async () => {
  const client = getClient(chains.mainnet);
  const processor = async (logs: GetFilterLogsReturnType) => {
    const data = (
      await Promise.all(
        logs.map(async (log) => {
          // @ts-ignore
          const index = log.args.index;

          const tx = await client.getTransaction({
            hash: log.transactionHash,
          });

          // Get the address of the depositor

          if (tx) {
            return {
              index: index.toString(),
              address: tx.from.toLowerCase() as Hex,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
              value: tx.value.toString(),
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

  const latestEvent = await prisma.beaconDepositEvent.findFirst({
    orderBy: {
      blockNumber: 'desc',
    },
  });

  await processLogs(
    client,
    DEPOSIT_EVENT,
    latestEvent?.blockNumber || FIRST_DEPOSIT_AT,
    processor,
    BEACON_CONTRACT,
    BigInt(100),
  );
};

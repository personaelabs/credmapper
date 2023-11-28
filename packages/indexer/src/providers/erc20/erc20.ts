import { ERC20TransferEvent, TransferEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import CONTRACTS from './contracts';
import { TRANSFER_EVENT } from './abi/abi';
import { ContractWithDeployedBlock } from '../../types';

// Sync `Transfer` events from ERC20 contracts
const indexTransferEvents = async (chain: Chain, contract: ContractWithDeployedBlock) => {
  const latestSyncedEvent = await prisma.eRC20TransferEvent.findFirst({
    select: {
      blockNumber: true,
    },
    orderBy: {
      blockNumber: 'desc',
    },
    where: {
      contractAddress: contract.address,
      chain: chain.name,
    },
  });

  const fromBlock = latestSyncedEvent
    ? latestSyncedEvent.blockNumber
    : BigInt(contract.deployedBlock);
  console.log('fromBlock', fromBlock);

  const processTransfers = async (logs: GetFilterLogsReturnType) => {
    const data = (
      await Promise.all(
        logs.map(async (log) => {
          const contractAddress = log.address.toLowerCase() as Hex;
          // @ts-ignore
          const from = log.args.from;
          // @ts-ignore
          const to = log.args.to;
          // @ts-ignore
          const value = log.args.value.toString();

          const logIndex = BigInt(log.logIndex);
          const transactionIndex = BigInt(log.transactionIndex);

          if (from && to && value != null && logIndex && transactionIndex) {
            return {
              contractAddress,
              from: from.toLowerCase() as Hex,
              to: to.toLowerCase() as Hex,
              value,
              blockNumber: log.blockNumber,
              transactionIndex: transactionIndex,
              logIndex: logIndex,
              transactionHash: log.transactionHash,
              chain: chain.name,
            };
          } else {
            return false;
          }
        }),
      )
    ).filter((data) => data) as ERC20TransferEvent[];

    await prisma.eRC20TransferEvent.createMany({
      data,
      skipDuplicates: true,
    });
  };

  await processLogs(chain, TRANSFER_EVENT, fromBlock, processTransfers, contract, BigInt(2000));
};

export const indexERC20 = async () => {
  const chain = chains.mainnet;
  // 1. Determine what block height to start syncing from.

  for (const contract of CONTRACTS) {
    await indexTransferEvents(chain, contract);
  }
};

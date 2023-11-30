import { TransferEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain, PublicClient, HttpTransport } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import CONTRACT_EVENTS from './contracts';
import { TRANSFER_EVENT } from './abi/abi';
import { ContractWithDeployedBlock } from '../../types';
import { getClient } from '../ethRpc';

// Sync `Transfer` events from ERC721 contracts
const indexTransferEvents = async (
  client: PublicClient<HttpTransport, Chain>,
  contract: ContractWithDeployedBlock,
) => {
  const latestSyncedEvent = await prisma.transferEvent.findFirst({
    select: {
      blockNumber: true,
    },
    orderBy: {
      blockNumber: 'desc',
    },
    where: {
      contractId: contract.id,
    },
  });

  const fromBlock = latestSyncedEvent
    ? latestSyncedEvent.blockNumber
    : BigInt(contract.deployedBlock);

  const processTransfers = async (logs: GetFilterLogsReturnType) => {
    const data = (
      await Promise.all(
        logs.map((log) => {
          // @ts-ignore
          const from = log.args.from;
          // @ts-ignore
          const to = log.args.to;
          // @ts-ignore
          const tokenId = log.args.tokenId;

          if (from && to && tokenId != null) {
            return {
              contractId: contract.id,
              from: from.toLowerCase() as Hex,
              to: to.toLowerCase() as Hex,
              tokenId: tokenId,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
            };
          } else {
            return false;
          }
        }),
      )
    ).filter((data) => data) as TransferEvent[];

    await prisma.transferEvent.createMany({
      data,
      skipDuplicates: true,
    });
  };

  await processLogs(client, TRANSFER_EVENT, fromBlock, processTransfers, contract, BigInt(1000));
};

export const indexERC721 = async () => {
  const chain = chains.mainnet;
  const client = getClient(chain);
  // Index all transfer events
  for (const contract of CONTRACT_EVENTS) {
    await indexTransferEvents(client, contract);
  }
};

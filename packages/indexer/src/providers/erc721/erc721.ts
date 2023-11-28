import { TransferEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import CONTRACT_EVENTS from './contracts';
import { TRANSFER_EVENT } from './abi/abi';
import { ContractWithDeployedBlock } from '../../types';

// Sync `Transfer` events from ERC721 contracts
const indexTransferEvents = async (chain: Chain, contract: ContractWithDeployedBlock) => {
  const latestSyncedEvent = await prisma.transferEvent.findFirst({
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

  const processTransfers = async (logs: GetFilterLogsReturnType) => {
    const data = (
      await Promise.all(
        logs.map((log) => {
          const contractAddress = log.address.toLowerCase() as Hex;

          // @ts-ignore
          const from = log.args.from;
          // @ts-ignore
          const to = log.args.to;
          // @ts-ignore
          const tokenId = log.args.tokenId;

          if (from && to && tokenId != null) {
            return {
              contractAddress,
              from: from.toLowerCase() as Hex,
              to: to.toLowerCase() as Hex,
              tokenId: tokenId.toString(),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              chain: chain.name,
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

  await processLogs(chain, TRANSFER_EVENT, fromBlock, processTransfers, contract, BigInt(1000));
};

export const indexERC721 = async () => {
  const chain = chains.mainnet;

  // Index all transfer events
  for (const contract of CONTRACT_EVENTS) {
    await indexTransferEvents(chain, contract);
  }
};

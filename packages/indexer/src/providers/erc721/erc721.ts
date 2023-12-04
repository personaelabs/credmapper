import { TransferEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain, PublicClient, HttpTransport } from 'viem';
import { processLogs } from '../../lib/processLogs';
import CONTRACT_EVENTS from './contracts';
import { TRANSFER_EVENT } from './abi/abi';
import { ContractWithDeployedBlock } from '../../types';
import { runInParallel } from '../../utils';

const indexTransferEvents = async (
  client: PublicClient<HttpTransport, Chain>,
  contract: ContractWithDeployedBlock,
) => {
  const latestSyncedEvent = await prisma.transferEvent.aggregate({
    _max: {
      blockNumber: true,
    },
    where: {
      contractId: contract.id,
    },
  });

  const fromBlock = latestSyncedEvent?._max.blockNumber || BigInt(contract.deployedBlock);

  const processTransfers = async (logs: GetFilterLogsReturnType) => {
    const data = logs.map((log) => {
      // @ts-ignore
      const from = log.args.from;
      // @ts-ignore
      const to = log.args.to;
      // @ts-ignore
      const tokenId = log.args.tokenId;

      const transactionIndex = log.transactionIndex;
      const logIndex = log.logIndex;

      return {
        contractId: contract.id,
        from: from.toLowerCase() as Hex,
        to: to.toLowerCase() as Hex,
        tokenId: tokenId,
        blockNumber: log.blockNumber,
        transactionIndex: transactionIndex,
        logIndex: logIndex,
      } as TransferEvent;
    });

    if (data.length > 0) {
      await prisma.transferEvent.createMany({
        data,
        skipDuplicates: true,
      });
    }
  };

  await processLogs(client, TRANSFER_EVENT, fromBlock, processTransfers, contract, BigInt(1000));
};

export const indexERC721 = async () => {
  await runInParallel(
    async (client: PublicClient<HttpTransport, Chain>, contract: ContractWithDeployedBlock) => {
      await indexTransferEvents(client, contract);
    },
    CONTRACT_EVENTS,
  );
};

export const syncERC721 = async () => {
  // In sync mode, we only process the contracts that are already indexed.
  const INDEXED_CONTRACTS = CONTRACT_EVENTS.filter((contract) => contract.indexed);

  console.log(`Syncing ${INDEXED_CONTRACTS.length} ERC721 contracts`);

  await runInParallel(
    async (client: PublicClient<HttpTransport, Chain>, contract: ContractWithDeployedBlock) => {
      await indexTransferEvents(client, contract);
    },
    INDEXED_CONTRACTS,
  );
};

import { PoapEventTokenEvent, PoapTransferEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain, PublicClient, HttpTransport } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import { getClient } from '../ethRpc';
import { TRANSFER_EVENT, EVENT_TOKEN_EVENT } from './abi/abi';
import CONTRACTS from '../../contracts/allContracts';

const POAP_CONTRACT = CONTRACTS.find(
  (contract) => contract.address === '0x22c1f6050e56d2876009903609a2cc3fef83b415',
)!;

const indexPoapTransferEvents = async (client: PublicClient<HttpTransport, Chain>) => {
  const latestSyncedBlock = await prisma.poapEventTokenEvent.aggregate({
    _max: {
      blockNumber: true,
    },
  });

  const fromBlock = latestSyncedBlock?._max.blockNumber
    ? latestSyncedBlock._max.blockNumber
    : POAP_CONTRACT.deployedBlock;

  const processor = async (
    logs: GetFilterLogsReturnType,
    args?: {
      fromBlock: bigint;
      toBlock: bigint;
    },
  ) => {
    const data = logs.map((log) => {
      // @ts-ignore
      const from = log.args.from;
      // @ts-ignore
      const to = log.args.to;
      // @ts-ignore
      const tokenId = log.args.tokenId;

      const logIndex = log.logIndex as number;
      const transactionIndex = log.transactionIndex as number;

      return {
        from: from.toLowerCase() as Hex,
        to: to.toLowerCase() as Hex,
        tokenId,
        blockNumber: log.blockNumber,
        transactionIndex: transactionIndex,
        logIndex: logIndex,
      } as PoapTransferEvent;
    });

    if (data.length > 0) {
      await prisma.poapTransferEvent.createMany({
        data,
        skipDuplicates: true,
      });
    }
  };

  await processLogs(client, TRANSFER_EVENT, fromBlock, processor, POAP_CONTRACT, BigInt(2000));
};

// Sync `Transfer` events from ERC721 contracts
const indexEventTokenEvents = async (client: PublicClient<HttpTransport, Chain>) => {
  const latestSynchedEvent = await prisma.poapTransferEvent.aggregate({
    _max: {
      blockNumber: true,
    },
  });

  const fromBlock = latestSynchedEvent?._max.blockNumber
    ? latestSynchedEvent._max.blockNumber
    : POAP_CONTRACT.deployedBlock;

  const processor = async (
    logs: GetFilterLogsReturnType,
    args?: {
      fromBlock: bigint;
      toBlock: bigint;
    },
  ) => {
    const data = logs
      .map((log) => {
        // @ts-ignore
        const eventId = log.args.eventId;
        // @ts-ignore
        const tokenId = log.args.tokenId;

        const logIndex = log.logIndex as number;
        const transactionIndex = log.transactionIndex as number;

        return {
          eventId: BigInt(eventId),
          tokenId: tokenId,
          blockNumber: log.blockNumber,
          logIndex,
          transactionIndex,
        };
      })
      .filter((log) => log) as PoapEventTokenEvent[];

    if (data.length > 0) {
      await prisma.poapEventTokenEvent.createMany({
        data,
        skipDuplicates: true,
      });
    }
  };

  await processLogs(client, EVENT_TOKEN_EVENT, fromBlock, processor, POAP_CONTRACT, BigInt(2000));
};

export const syncPoap = async () => {
  const client1 = getClient(chains.mainnet, 0);
  const client2 = getClient(chains.mainnet, 1);
  await Promise.all([indexEventTokenEvents(client1), indexPoapTransferEvents(client2)]);
};

import { PoapEventTokenEvent, PoapTransferEvent, TransferEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain, PublicClient, HttpTransport } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import { NUM_MAINNET_CLIENTS, getClient } from '../ethRpc';
import { TRANSFER_EVENT, EVENT_TOKEN_EVENT } from './abi/abi';
import events from './events';
import { runInParallel } from '../../utils';

const POAP_DEPLOYED_BLOCK = 7844214;
const POAP_CONTRACT = {
  id: 302,
  address: '0x22c1f6050e56d2876009903609a2cc3fef83b415' as Hex,
  deployedBlock: BigInt(POAP_DEPLOYED_BLOCK),
};

const indexEventTransferEvents = async (client: PublicClient<HttpTransport, Chain>) => {
  const operationId = 'PoapTransferEvent'; // TODO: Move this out to a separate file

  const latestSyncedBlock = await prisma.syncInfo.findFirst({
    select: {
      blockNumber: true,
    },
    where: {
      operation: operationId,
    },
  });

  const fromBlock = latestSyncedBlock ? latestSyncedBlock.blockNumber : BigInt(POAP_DEPLOYED_BLOCK);

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

    const syncInfo = {
      operation: operationId,
      blockNumber: args!.toBlock,
    };

    await prisma.syncInfo.upsert({
      where: {
        operation: operationId,
      },
      create: syncInfo,
      update: syncInfo,
    });
  };

  await processLogs(client, TRANSFER_EVENT, fromBlock, processor, POAP_CONTRACT, BigInt(2000));
};

// Sync `Transfer` events from ERC721 contracts
const indexEventTokenEvents = async (
  client: PublicClient<HttpTransport, Chain>,
  eventId: number,
) => {
  const operationId = `PoapEventTokenEvent-${eventId}`;
  const latestSyncedBlock = await prisma.syncInfo.findFirst({
    select: {
      blockNumber: true,
    },
    where: {
      operation: operationId,
    },
  });

  const fromBlock = latestSyncedBlock ? latestSyncedBlock.blockNumber : BigInt(POAP_DEPLOYED_BLOCK);

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
        const logEventId = log.args.eventId;
        // @ts-ignore
        const tokenId = log.args.tokenId;

        if (logEventId === BigInt(eventId)) {
          const logIndex = log.logIndex as number;
          const transactionIndex = log.transactionIndex as number;

          return {
            eventId: BigInt(eventId),
            tokenId: tokenId,
            blockNumber: log.blockNumber,
            logIndex,
            transactionIndex,
          };
        } else {
          return null;
        }
      })
      .filter((log) => log) as PoapEventTokenEvent[];

    if (data.length > 0) {
      await prisma.poapEventTokenEvent.createMany({
        data,
        skipDuplicates: true,
      });
    }

    const syncInfo = {
      operation: operationId,
      blockNumber: args!.toBlock,
    };

    await prisma.syncInfo.upsert({
      where: {
        operation: operationId,
      },
      create: syncInfo,
      update: syncInfo,
    });
  };

  await processLogs(client, EVENT_TOKEN_EVENT, fromBlock, processor, POAP_CONTRACT, BigInt(2000));
};

export const indexPoap = async () => {
  const eventIds = events.map((event) => event.id);
  await runInParallel(indexEventTokenEvents, eventIds);
  await runInParallel(indexEventTransferEvents, eventIds);
};

export const syncPoap = async () => {
  const indexedEventIds = events.filter((event) => event.indexed).map((event) => event.id);
  console.log(`Syncing ${indexedEventIds.length} Poap events`);
  await runInParallel(indexEventTokenEvents, indexedEventIds);

  const client = getClient(chains.mainnet);
  await indexEventTransferEvents(client);
};

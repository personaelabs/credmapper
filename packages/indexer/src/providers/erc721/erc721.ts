import { TransferEvent } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain } from 'viem';
import { processLogs } from '../../lib/processLogs';
import * as chains from 'viem/chains';
import { bigIntMin } from '../../utils';
import { AbiEvent } from 'abitype';
import CONTRACT_EVENTS from './contractEvents';
import { TRANSFER_EVENT } from './abi/abi';

// Sync `Transfer` events from ERC721 contracts
const indexTransferEvents = async (
  chain: Chain,
  contractAddress: Hex[],
  event: AbiEvent,
  fromBlock: bigint,
) => {
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

  await processLogs(chain, event, fromBlock, processTransfers, contractAddress, BigInt(1000));
};

export const indexERC721 = async () => {
  const chain = chains.mainnet;
  // 1. Determine what block height to start syncing from.

  // Get the latest synched block number for each contract.
  const latestEvents = await prisma.transferEvent.groupBy({
    by: ['contractAddress'],
    _max: {
      blockNumber: true,
    },
    where: {
      chain: chain.name,
    },
  });

  const synchedContracts = latestEvents.map((event) => event.contractAddress);

  // Get the contracts that have never been synced.
  const unsynchedContracts = CONTRACT_EVENTS.filter(
    (contractEvent) => !synchedContracts.includes(contractEvent.address),
  );

  // Get the smallest block number from `unsynchedContracts` and `latestEvents`.
  const fromBlock = bigIntMin(
    ...unsynchedContracts.map((contract) => BigInt(contract.deployedBlock)),
    ...latestEvents.map((event) => event._max.blockNumber as bigint),
  );

  // Index all transfer events
  await indexTransferEvents(
    chain,
    CONTRACT_EVENTS.map((contractEvent) => contractEvent.address),
    TRANSFER_EVENT,
    fromBlock,
  );
};

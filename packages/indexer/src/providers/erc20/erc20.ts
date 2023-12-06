import { ERC20TransferEvent2 } from '@prisma/client';
import prisma from '../../prisma';
import { GetFilterLogsReturnType, Hex, Chain, PublicClient, HttpTransport } from 'viem';
import { processLogs } from '../../lib/processLogs';
import CONTRACTS from './contracts';
import { TRANSFER_EVENT } from './abi/abi';
import { ContractWithDeployedBlock } from '../../types';
import { runInParallel } from '../../utils';
import chalk from 'chalk';

// Sync `Transfer` events from ERC20 contracts
const indexTransferEvents = async (
  client: PublicClient<HttpTransport, Chain>,
  contract: ContractWithDeployedBlock,
) => {
  const label = `find latest event ${contract.id}`;
  console.time(label);
  const latestSyncedEvent = await prisma.eRC20TransferEvent2.aggregate({
    _max: {
      blockNumber: true,
    },
    where: {
      contractId: contract.id,
    },
  });

  console.timeEnd(label);

  const fromBlock = latestSyncedEvent._max.blockNumber || BigInt(contract.deployedBlock);

  const processTransfers = async (logs: GetFilterLogsReturnType) => {
    const data = logs
      .map((log) => {
        // @ts-ignore
        const from = log.args.from;
        // @ts-ignore
        const to = log.args.to;
        // @ts-ignore
        const value = log.args.value.toString();

        const logIndex = log.logIndex;
        const transactionIndex = log.transactionIndex;

        return {
          contractId: contract.id,
          from: from.toLowerCase() as Hex,
          to: to.toLowerCase() as Hex,
          value,
          blockNumber: log.blockNumber,
          transactionIndex: transactionIndex,
          logIndex: logIndex,
        };
      })
      .filter((data) => data) as ERC20TransferEvent2[];

    if (data.length > 0) {
      console.log(chalk.gray(`Writing ${data.length} events for ${contract.id}`));
      const result = await prisma.eRC20TransferEvent2.createMany({
        data,
        skipDuplicates: true,
      });
    }
  };

  await processLogs(client, TRANSFER_EVENT, fromBlock, processTransfers, contract, BigInt(2000));
};

export const indexERC20 = async () => {
  await runInParallel(indexTransferEvents, CONTRACTS);
};

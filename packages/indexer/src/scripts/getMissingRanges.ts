import prisma from '../prisma';
import { GetFilterLogsReturnType, Hex, HttpTransport, PublicClient } from 'viem';
import { ERC20TransferEvent } from '@prisma/client';
import { processLogs } from '../lib/processLogs';
import * as chains from 'viem/chains';
import { TRANSFER_EVENT } from '../providers/erc20/abi/abi';
import { ContractWithDeployedBlock } from '../types';
import CONTRACTS from '../contracts/erc20';
import { runInParallel } from '../utils';

const BATCH_SIZE = 2000;

type QueryResult = {
  next_block: bigint;
  blockNumber: bigint;
};

const indexMissingRange = async (
  client: PublicClient<HttpTransport, chains.Chain>,
  contract: ContractWithDeployedBlock,
  fromBlock: bigint,
  toBlock: bigint,
) => {
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
      .filter((data) => data) as ERC20TransferEvent[];

    if (data.length > 0) {
      await prisma.eRC20TransferEvent.createMany({
        data,
        skipDuplicates: true,
      });
    }
  };

  await processLogs(
    client,
    TRANSFER_EVENT,
    fromBlock,
    processTransfers,
    contract,
    BigInt(2000),
    undefined,
    toBlock,
  );
};

const getMissingRanges = async (
  client: PublicClient<HttpTransport, chains.Chain>,
  contract: ContractWithDeployedBlock,
) => {
  const label = `getMissingRanges for ${contract.id}`;
  console.time(label);
  const missingRanges = await prisma.$queryRaw<QueryResult[]>`
    SELECT
	current_row. "blockNumber",
	next_block
    FROM (
        SELECT
            *,
            LEAD("blockNumber") OVER (ORDER BY "blockNumber") AS next_block
        FROM
            "ERC20TransferEvent2" where "contractId" = ${contract.id}
        ) AS current_row 
        
    WHERE
        next_block - "blockNumber" > ${BATCH_SIZE};
            `;
  console.timeEnd(label);

  for (const range of missingRanges) {
    const start = range.blockNumber;
    const end = range.next_block;

    await indexMissingRange(client, contract, start, end);
  }
};

runInParallel(getMissingRanges, CONTRACTS).then(() => {
  console.log('Synched missing ranges');
});

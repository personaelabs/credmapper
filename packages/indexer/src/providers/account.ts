import { Hex } from 'viem';
import etherscan from './etherscan';
import { batchRun, sleep } from '../utils';
import prisma from '../prisma';
import { TxListResponse } from '../types';
import { AddressInfo } from '@prisma/client';
import * as chains from 'viem/chains';

const indexChains = [chains.mainnet, chains.optimism];
export const indexAccounts = async (addresses: Hex[]) => {
  await Promise.all(
    indexChains.map(async (chain) => {
      const etherscanClient = etherscan(chain);
      await batchRun(
        async (batch) => {
          const addressesInfo = (
            await Promise.all(
              batch.map(async (address) => {
                const result = await etherscanClient.get<TxListResponse>('', {
                  params: {
                    module: 'account',
                    action: 'txlist',
                    startBlock: 0,
                    address: address,
                    sort: 'asc',
                    page: 1,
                  },
                });

                if (result.data.result.length > 0) {
                  const outgoingTxs = result.data.result.filter(
                    (tx) => tx.from.toLowerCase() === address,
                  );
                  const txCount = outgoingTxs.length;
                  const firstTx = result.data.result[0];
                  const contractDeployments = result.data.result.filter((tx: any) => tx.to === '');

                  return {
                    network: chain.name,
                    address: address.toLowerCase(),
                    txCount,
                    firstTx: firstTx.hash,
                    firstTxTimestamp: new Date(parseInt(firstTx.timeStamp) * 1000),
                    contractDeployments: contractDeployments.map((tx) => tx.hash),
                  };
                }

                return false;
              }),
            )
          ).filter((data) => data) as AddressInfo[];

          await prisma.addressInfo.createMany({
            data: addressesInfo,
            skipDuplicates: true,
          });

          await sleep(1500);
        },
        addresses,
        'accountInfo',
        4,
      );
    }),
  );
};

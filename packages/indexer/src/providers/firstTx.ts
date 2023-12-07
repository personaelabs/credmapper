import etherscan from './etherscan';
import { batchRun, sleep } from '../utils';
import prisma from '../prisma';
import { TxListResponse } from '../types';
import * as chains from 'viem/chains';
import { getAllAddresses } from './farcaster';

export const syncFirstTxs = async () => {
  const connectedAddresses = await getAllAddresses();
  const addresses = connectedAddresses.map((account) => account.verified_addresses).flat();

  // Get addresses that are already indexed
  const indexedAddresses = (
    await prisma.address.findMany({
      select: {
        address: true,
      },
    })
  ).map((address) => address.address);

  // Get addresses that are not indexed
  const addressesToIndex = [
    ...new Set(addresses.filter((address) => !indexedAddresses.includes(address))),
  ];

  const etherscanClient = etherscan(chains.mainnet);
  await batchRun(
    async (batch) => {
      await Promise.all(
        batch.map(async (address) => {
          try {
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

            const fid = connectedAddresses.find((account) =>
              account.verified_addresses.includes(address),
            )?.fid;

            if (fid) {
              const txs = result.data.result;
              const firstTx = txs.length > 0 ? txs[0] : null;

              await prisma.address.create({
                data: {
                  network: chains.mainnet.name,
                  address: address.toLowerCase(),
                  firstTx: firstTx?.hash,
                  firstTxTimestamp: firstTx ? new Date(parseInt(firstTx.timeStamp) * 1000) : null,
                  userFid: fid,
                },
              });
            }
          } catch (err) {
            console.log(err);
          }
        }),
      );

      await sleep(1500);
    },
    addressesToIndex,
    'accountInfo',
    4,
  );
};

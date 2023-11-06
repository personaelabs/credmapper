import { Chain, TransferEvent } from '@prisma/client';
import { getSynchedBlock } from '../../lib/syncInfo';
import prisma from '../../prisma';
import { Abi, GetFilterLogsReturnType, Hex } from 'viem';
import { getClient } from '../ethRpc';
import * as chains from 'viem/chains';
import { syncLogs } from '../../lib/syncLogs';
import { ZoraNFT, ZoraNFTMetadata } from '../../types';
import { batchRun } from '../../utils';
import ERC721 from './abi/ERC721.json';
import * as ipfs from '../../providers/ipfs';
import axios from 'axios';

// Sync metadata of 721 tokens minted by Farcaster users.
// (We don't sync metadata of 721 tokens that haven't been minted by Farcaster users)
export const sync721Tokens = async (chain: Chain) => {
  const client = getClient(chain);

  const connectedAddress = (
    await prisma.connectedAddress.findMany({
      select: {
        address: true,
      },
    })
  ).map((a) => a.address) as Hex[];

  const synchedBlock = (await getSynchedBlock('ERC721Token', chain)) || BigInt(0);

  const contracts = await prisma.transferEvent.groupBy({
    where: {
      chain,
      to: {
        in: connectedAddress,
      },
      blockNumber: {
        gte: synchedBlock,
      },
    },
    by: ['contractAddress'],
  });

  await batchRun(
    async (batch) => {
      const nfts = (
        await Promise.all(
          batch.map(async (contract) => {
            try {
              const uri = (await client.readContract({
                address: contract.contractAddress as Hex,
                abi: ERC721 as Abi,
                functionName: 'contractURI',
              })) as string;

              // Some tokens have their metadata directly stored as base64 strings
              if (uri.includes('base64')) {
                const decoded = atob(uri.split(',')[1]);
                return JSON.parse(decoded);
              } else if (uri.includes('https://metadata')) {
                const { data } = await axios.get(uri);

                return {
                  name: data.name,
                  description: data.description,
                  image: data.image,
                  animation: data.animation_url,
                  contractAddress: contract.contractAddress,
                };
              } else {
                const data = await ipfs.get<ZoraNFTMetadata>(
                  uri.replace('ipfs://', '').replace('https://ipfs.io/ipfs/', '').split('?')[0],
                );

                return {
                  name: data.name,
                  description: data.description,
                  image: data.image,
                  contractAddress: contract.contractAddress,
                };
              }
            } catch (err) {
              console.log(err);
            }
          }),
        )
      ).filter((data) => data) as ZoraNFT[];

      await prisma.eRC721Contract.createMany({
        data: nfts.map((data, i) => ({
          contractAddress: batch[i].contractAddress,
          name: data.name || '',
          description: data.description || '',
          image: data.image || '',
          chain: chain,
        })),
        skipDuplicates: true,
      });
    },
    contracts,
    'ERC721 contract',
    100,
  );
};

// Sync `Transfer` events from 721 contracts
export const syncTransferEvents = async (chain: Chain, contractAddress?: Hex | Hex[]) => {
  const synchedBlock = await getSynchedBlock('Transfer', chain);

  const fromBlock = synchedBlock ? BigInt(synchedBlock) : BigInt(0);

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
              chain,
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

  await syncLogs(
    chain,
    'Transfer',
    [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    fromBlock,
    processTransfers,
    contractAddress,
    BigInt(1000),
  );
};

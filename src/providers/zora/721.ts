import { Chain, TransferEvent } from '@prisma/client';
import { getSynchedBlock } from '../../lib/syncInfo';
import prisma from '../../prisma';
import { Abi, GetFilterLogsReturnType, Hex } from 'viem';
import { getClient } from '../ethRpc';
import * as chains from 'viem/chains';
import { syncLogs } from '../../lib/syncLogs';
import { ZoraNFT, ZoraNFTMetadata } from '../../types';
import { batchRun } from '../../utils';
import ERC721Drop from './abi/ERC721Drop.json';
import * as ipfs from '../../providers/ipfs';

// Sync metadata of 721 tokens minted by Farcaster users.
// (We don't sync metadata of 721 tokens that haven't been minted by Farcaster users)
export const sync721Tokens = async () => {
  const client = getClient(chains.zora);

  const connectedAddress = (
    await prisma.connectedAddress.findMany({
      select: {
        address: true,
      },
    })
  ).map((a) => a.address) as Hex[];

  const synchedBlock = (await getSynchedBlock('ERC721Token', Chain.Zora)) || BigInt(0);

  const transfers = await prisma.transferEvent.findMany({
    where: {
      to: {
        in: connectedAddress,
      },
      blockNumber: {
        gte: synchedBlock,
      },
    },
  });

  await batchRun(
    async (batch) => {
      const nfts = (
        await Promise.all(
          batch.map(async (transfer) => {
            try {
              const uri = (await client.readContract({
                address: transfer.contractAddress as Hex,
                abi: ERC721Drop.abi as Abi,
                functionName: 'tokenURI',
                args: [transfer.tokenId],
              })) as string;

              // Some tokens have their metadata directly stored as base64 strings
              if (uri.includes('base64')) {
                const decoded = atob(uri.split(',')[1]);
                return JSON.parse(decoded);
              } else {
                console.log(uri);
                const data = await ipfs.get<ZoraNFTMetadata>(
                  uri.replace('ipfs://', '').replace('https://ipfs.io/ipfs/', '').split('?')[0],
                );

                return {
                  name: data.name,
                  description: data.description,
                  image: data.image,
                  animation: data.animation_url,
                  contractAddress: transfer.contractAddress,
                  tokenId: transfer.tokenId,
                };
              }
            } catch (err) {
              console.log(err);
            }
          }),
        )
      ).filter((data) => data) as ZoraNFT[];

      await prisma.eRC721Token.createMany({
        data: nfts.map((data, i) => ({
          contractAddress: batch[i].contractAddress,
          tokenId: batch[i].tokenId,
          name: data.name || '',
          description: data.description || '',
          image: data.image || '',
          animation: data.animation_url,
          chain: Chain.Zora,
        })),
        skipDuplicates: true,
      });

      await prisma.syncInfo.upsert({
        where: {
          eventName_chain: {
            eventName: 'ERC721Token',
            chain: Chain.Zora,
          },
        },
        update: {
          synchedBlock: batch[batch.length - 1].blockNumber,
        },
        create: {
          eventName: 'ERC721Token',
          chain: Chain.Zora,
          synchedBlock: batch[batch.length - 1].blockNumber,
        },
      });
    },
    transfers,
    'ERC721',
  );
};

// Sync `Transfer` events from 721 contracts
export const syncTransferEvents = async () => {
  const synchedBlock = await getSynchedBlock('Transfer', Chain.Zora);

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
              chain: Chain.Zora,
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

  const client = getClient(chains.zora);
  await syncLogs(
    client,
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
    BigInt(1000),
  );
};

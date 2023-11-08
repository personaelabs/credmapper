import prisma from '../../prisma';
import { Abi, GetFilterLogsReturnType, Hex } from 'viem';
import { syncLogs } from '../../lib/syncLogs';
import { getClient } from '../ethRpc';
import { getSynchedBlock } from '../../lib/syncInfo';
import { ZoraNFT, ZoraNFTMetadata } from '../../types';
import ZoraCreator1155Impl from './abi/ZoraCreator1155Impl.json';
import * as ipfs from '../../providers/ipfs';
import { Chain } from '@prisma/client';
import { batchRun } from '../../utils';
import { AbiEvent } from 'abitype';

const PURCHASE_EVENT = ZoraCreator1155Impl.abi.find((abi) => abi.name === 'Purchased') as AbiEvent;

// Sync metadata of 1155 tokens minted by Farcaster users.
// (We don't sync metadata of 1155 tokens that haven't been minted by Farcaster users)
export const sync1155Tokens = async (chain: Chain) => {
  const client = getClient(chain);
  const synchedBlock = (await getSynchedBlock('ERC1155Token', chain)) || BigInt(0);

  const purchasedTokens = await prisma.purchasedEvent.groupBy({
    where: {
      blockNumber: {
        gte: synchedBlock,
      },
    },
    by: ['contractAddress', 'tokenId'],
  });
  const allNFTs: ZoraNFT[] = [];

  await batchRun(async (batch) => {
    const nfts = await Promise.all(
      batch.map(async (token) => {
        try {
          const uri = await client.readContract({
            address: token.contractAddress as Hex,
            abi: ZoraCreator1155Impl.abi as Abi,
            functionName: 'uri',
            args: [token.tokenId],
          });
          const data = await ipfs.get<ZoraNFTMetadata>((uri as string).replace('ipfs://', ''));
          return {
            ...data,
            contractAddress: token.contractAddress,
            tokenId: token.tokenId,
          };
        } catch (err) {
          console.log(err);
          return false;
        }
      }),
    );

    allNFTs.push(...(nfts.filter((data) => data) as ZoraNFT[]));
  }, purchasedTokens);

  const purchases = await prisma.purchasedEvent.findMany({
    where: {
      chain,
      blockNumber: {
        gte: synchedBlock,
      },
    },
  });

  await batchRun(
    async (batch) => {
      const nfts = (
        await Promise.all(
          batch.map(async (purchase) =>
            allNFTs.find(
              (nft) =>
                nft.contractAddress === purchase.contractAddress &&
                nft.tokenId === purchase.tokenId,
            ),
          ),
        )
      ).filter((data) => data) as ZoraNFT[];

      await prisma.eRC1155Token.createMany({
        data: nfts.map((data, i) => ({
          contractAddress: batch[i].contractAddress,
          tokenId: batch[i].tokenId,
          name: data.name || '',
          description: data.description || '',
          image: data.image || '',
          animation: data.animation_url,
          chain: chain,
        })),
        skipDuplicates: true,
      });

      await prisma.syncInfo.upsert({
        where: {
          eventName_chain: {
            eventName: 'ERC1155Token',
            chain: chain,
          },
        },
        update: {
          synchedBlock: batch[batch.length - 1].blockNumber,
        },
        create: {
          eventName: 'ERC1155Token',
          chain: chain,
          synchedBlock: batch[batch.length - 1].blockNumber,
        },
      });
    },
    purchases,
    'ERC1155',
  );
};

// Sync `Purchased` events from 1155 contracts
export const syncPurchasedEvents = async (chain: Chain) => {
  const synchedBlock = await getSynchedBlock('Purchased', chain);

  const fromBlock = synchedBlock ? BigInt(synchedBlock) : BigInt(0);

  const processPurchases = async (logs: GetFilterLogsReturnType) => {
    const data = await Promise.all(
      logs.map(async (log) => {
        const contractAddress = log.address.toLowerCase() as Hex;
        // @ts-ignore
        const quantity = log.args.quantity;
        // @ts-ignore
        const value = log.args.value;
        // @ts-ignore
        const tokenId = log.args.tokenId;
        // @ts-ignore
        const minter = log.args.sender.toLowerCase() as Hex;

        // Get the image of the token

        return {
          contractAddress,
          quantity,
          minter,
          value,
          tokenId,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          chain,
        };
      }),
    );

    await prisma.purchasedEvent.createMany({
      data,
      skipDuplicates: true,
    });
  };

  await syncLogs(chain, PURCHASE_EVENT, fromBlock, processPurchases);
};

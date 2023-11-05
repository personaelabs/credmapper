import prisma from '../../prisma';
import { Abi, GetFilterLogsReturnType, Hex } from 'viem';
import { syncLogs } from '../../lib/syncLogs';
import { getClient } from '../ethRpc';
import { getSynchedBlock } from '../../lib/syncInfo';
import { ZoraNFT, ZoraNFTMetadata } from '../../types';
import ZoraCreator1155Impl from './abi/ZoraCreator1155Impl.json';
import * as ipfs from '../../providers/ipfs';
import { Chain } from '@prisma/client';
import * as chains from 'viem/chains';
import { batchRun } from '../../utils';

export const sync1155Tokens = async () => {
  const client = getClient(chains.zora);
  const synchedBlock = (await getSynchedBlock('ERC1155Token', Chain.Zora)) || BigInt(0);

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
          chain: Chain.Zora,
        })),
        skipDuplicates: true,
      });

      await prisma.syncInfo.upsert({
        where: {
          eventName_chain: {
            eventName: 'ERC1155Token',
            chain: Chain.Zora,
          },
        },
        update: {
          synchedBlock: batch[batch.length - 1].blockNumber,
        },
        create: {
          eventName: 'ERC1155Token',
          chain: Chain.Zora,
          synchedBlock: batch[batch.length - 1].blockNumber,
        },
      });
    },
    purchases,
    'ERC1155',
  );
};

export const syncPurchasedEvents = async () => {
  const synchedBlock = await getSynchedBlock('Purchased', Chain.Zora);

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
          chain: Chain.Zora,
        };
      }),
    );

    await prisma.purchasedEvent.createMany({
      data,
      skipDuplicates: true,
    });
  };

  const client = getClient(chains.zora);
  await syncLogs(
    client,
    'Purchased',
    [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'minter',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'quantity',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    fromBlock,
    processPurchases,
  );
};

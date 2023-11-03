import prisma from '../../prisma';
import * as ipfs from '../../providers/ipfs';
import { Abi, GetFilterLogsReturnType, Hex, trim } from 'viem';
import { chains } from '../../utils';
import ZoraNFTCreatorV1 from './abi/ZoraNFTCreatorV1.json';
import DropMetadataRenderer from './abi/DropMetadataRenderer.json';
import { ZoraNFTMetadata } from '../../types';
import { syncLogs } from '../../lib/sync';
import { Prisma } from '@prisma/client';
import contracts from './contracts';
import { ToDBChain } from '../../utils';
import { getClient } from '../ethRpc';

const syncChains = [chains.optimism, chains.mainnet, chains.base, chains.zora];

export const syncCreatedDrops = async () => {
  for (const chain of syncChains) {
    console.log(`Syncing created drops for ${chain.name}`);
    const chainContracts = contracts(chain);
    const latestEvent = await prisma.createDropEvent.findFirst({
      orderBy: { blockNumber: 'desc' },
      where: {
        chain: ToDBChain(chain),
      },
    });

    const fromBlock = latestEvent
      ? BigInt(latestEvent.blockNumber)
      : BigInt(chainContracts.ZORA_NFT_CREATOR_PROXY.deployedBlock || 0);

    const connectedAddresses = (
      await prisma.connectedAddress.findMany({
        select: {
          address: true,
        },
      })
    ).map((a) => a.address);

    const client = getClient(chain);
    await syncLogs(
      client,
      ZoraNFTCreatorV1.abi as Abi,
      chainContracts.ZORA_NFT_CREATOR_PROXY.address,
      'CreatedDrop',
      fromBlock,
      async (logs) => {
        const createDropEvents = logs.map((log) => {
          const creator = trim(log.topics[1] as Hex).toLowerCase();
          return {
            creator,
            editionContractAddress: trim(log.topics[2] as Hex).toLowerCase(),
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            connectedCreator: connectedAddresses.find(
              (address) => address.toLowerCase() === creator.toLowerCase(),
            ),
            chain: ToDBChain(chain),
          };
        });

        await prisma.createDropEvent.createMany({
          data: createDropEvents,
          skipDuplicates: true,
        });
      },
    );
  }
};

export const syncMetadataUpdated = async () => {
  for (const chain of syncChains) {
    console.log(`Syncing metadata updates for ${chain}`);
    const latestEvent = await prisma.metadataUpdateEvent.findFirst({
      orderBy: { blockNumber: 'desc' },
    });

    const chainContracts = contracts(chain);

    const fromBlock = latestEvent
      ? BigInt(latestEvent.blockNumber)
      : BigInt(chainContracts.DROP_METADATA_RENDERER.deployedBlock || 0);

    const saveMetadataUpdate = async (logs: GetFilterLogsReturnType) => {
      const metadata = (
        await Promise.all(
          logs.map(async (log) => {
            // @ts-ignore
            const contractURI = log.args.contractURI as string;
            // @ts-ignore
            const contractAddress = log.args.target.toLowerCase() as Hex;

            try {
              const data: ZoraNFTMetadata = await ipfs.get(contractURI.replace('ipfs://', ''));
              return {
                contractAddress,
                name: data.name,
                description: data.description,
                image: data.image,
                tokenURI: contractURI,
                blockNumber: log.blockNumber,
                transactionHash: log.transactionHash,
              };
            } catch (err) {
              console.log(err);
              return false;
            }
          }),
        )
      ).filter((meta) => meta !== false) as Prisma.MetadataUpdateEventCreateManyInput[];

      try {
        await prisma.metadataUpdateEvent.createMany({
          data: metadata,
          skipDuplicates: true,
        });
      } catch (err) {
        console.log(err);
      }
    };

    const client = getClient(chain);
    await syncLogs(
      client,
      DropMetadataRenderer.abi as Abi,
      chainContracts.DROP_METADATA_RENDERER.address,
      'MetadataUpdated',
      fromBlock,
      saveMetadataUpdate,
    );
  }
};

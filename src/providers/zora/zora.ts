import prisma from '../../prisma';
import * as ipfs from '../../providers/ipfs';
import { Abi, GetFilterLogsReturnType, Hex, createPublicClient, http, trim } from 'viem';
import { zora } from 'viem/chains';
import ZoraNFTCreatorV1 from './abi/ZoraNFTCreatorV1.json';
import DropMetadataRenderer from './abi/DropMetadataRenderer.json';
import { ZoraNFTMetadata } from '../../types';
import { syncLogs } from '../../lib/sync';
import { Prisma } from '@prisma/client';

const publicClient = createPublicClient({
  chain: zora,
  transport: http('https://rpc.zora.energy'),
});

export const syncCreatedDrops = async () => {
  const latestEvent = await prisma.createDropEvent.findFirst({
    orderBy: { blockNumber: 'desc' },
  });

  const fromBlock = latestEvent ? BigInt(latestEvent.blockNumber) : BigInt(0);

  const connectedAddresses = (
    await prisma.connectedAddress.findMany({
      select: {
        address: true,
      },
    })
  ).map((a) => a.address);

  await syncLogs(
    publicClient,
    ZoraNFTCreatorV1.abi as Abi,
    '0xA2c2A96A232113Dd4993E8b048EEbc3371AE8d85',
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
        };
      });

      await prisma.createDropEvent.createMany({
        data: createDropEvents,
        skipDuplicates: true,
      });
    },
  );
};

export const syncMetadataUpdated = async () => {
  const latestEvent = await prisma.metadataUpdateEvent.findFirst({
    orderBy: { blockNumber: 'desc' },
  });

  const fromBlock = latestEvent ? BigInt(latestEvent.blockNumber) : BigInt(0);

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
    console.log('done');

    try {
      await prisma.metadataUpdateEvent.createMany({
        data: metadata,
        skipDuplicates: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  await syncLogs(
    publicClient,
    DropMetadataRenderer.abi as Abi,
    '0x4A0ad3Ef9bE8095590D854bC8481C9E50922a3c0',
    'MetadataUpdated',
    fromBlock,
    saveMetadataUpdate,
  );
};

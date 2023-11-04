import prisma from '../../prisma';
import * as ipfs from '../../providers/ipfs';
import { Abi, GetFilterLogsReturnType, Hex } from 'viem';
import { chains } from '../../utils';
import ZoraNFTCreatorV1 from './abi/ZoraNFTCreatorV1.json';
import DropMetadataRenderer from './abi/DropMetadataRenderer.json';
import ERC721Drop from './abi/ERC721Drop.json';
import EditionMetadataRenderer from './abi/EditionMetadataRenderer.json';
import { ZoraNFTMetadata } from '../../types';
import { syncContractLogs } from '../../lib/sync';
import { Prisma } from '@prisma/client';
import contracts from './contracts';
import { ToDBChain } from '../../utils';
import { getClient } from '../ethRpc';
import { getSynchedBlock } from '../../lib/syncInfo';

const syncChains = [chains.zora, chains.optimism, chains.base];

// Sync the `CreatedDrop` logs
export const syncCreatedDrops = async () => {
  for (const chain of syncChains) {
    const chainContracts = contracts(chain);
    const synchedBlock = await getSynchedBlock('CreatedDrop', ToDBChain(chain));

    const fromBlock = synchedBlock
      ? BigInt(synchedBlock)
      : BigInt(chainContracts.ZORA_NFT_CREATOR_PROXY.deployedBlock || 0);

    const connectedAddresses = (
      await prisma.connectedAddress.findMany({
        select: {
          address: true,
        },
      })
    ).map((a) => a.address);

    const client = getClient(chain);
    await syncContractLogs(
      client,
      ZoraNFTCreatorV1.abi as Abi,
      chainContracts.ZORA_NFT_CREATOR_PROXY.address,
      'CreatedDrop',
      fromBlock,
      async (logs) => {
        const createDropEvents = logs.map((log) => {
          // @ts-ignore
          const creator = log.args.creator.toLowerCase() as Hex;
          // @ts-ignore
          const editionContractAddress = log.args.editionContractAddress.toLowerCase() as Hex;
          return {
            creator,
            editionContractAddress,
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

// Sync the `MetadataUpdated` logs
export const syncMetadataUpdated = async () => {
  for (const chain of syncChains) {
    const synchedBlock = await getSynchedBlock('MetadataUpdated', ToDBChain(chain));

    const chainContracts = contracts(chain);

    const fromBlock = synchedBlock
      ? BigInt(synchedBlock)
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
                chain: ToDBChain(chain),
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
    await syncContractLogs(
      client,
      DropMetadataRenderer.abi as Abi,
      chainContracts.DROP_METADATA_RENDERER.address,
      'MetadataUpdated',
      fromBlock,
      saveMetadataUpdate,
    );
  }
};

// Sync the `EditionInitialized` logs
export const syncEditionInitialized = async () => {
  for (const chain of syncChains) {
    const synchedBlock = await getSynchedBlock('EditionInitialized', ToDBChain(chain));

    const chainContracts = contracts(chain);

    const fromBlock = synchedBlock
      ? BigInt(synchedBlock)
      : // @ts-ignore
        BigInt(chainContracts.EDITION_METADATA_RENDERER.deployedBlock || 0);

    const processEditionInitialized = async (logs: GetFilterLogsReturnType) => {
      const metadata = (
        await Promise.all(
          logs.map(async (log) => {
            // @ts-ignore
            const contractAddress = log.args.target.toLowerCase() as Hex;
            // @ts-ignore
            const description = log.args.description as string;
            // @ts-ignore
            const imageURI = log.args.imageURI as string;
            // @ts-ignore
            const animationURI = log.args.animationURI as string;

            try {
              return {
                contractAddress,
                description: description,
                imageURI,
                animationURI,
                blockNumber: log.blockNumber,
                transactionHash: log.transactionHash,
                chain: ToDBChain(chain),
              };
            } catch (err) {
              console.log(err);
              return false;
            }
          }),
        )
      ).filter((meta) => meta !== false) as Prisma.EditionInitializedEventCreateManyInput[];

      try {
        const dropAddresses = (
          await prisma.createDropEvent.findMany({
            where: {
              editionContractAddress: {
                in: metadata.map((m) => m.contractAddress),
              },
            },
          })
        ).map((e) => e.editionContractAddress);

        await prisma.editionInitializedEvent.createMany({
          // TODO: Fix address format and remove this filter
          data: metadata.filter((meta) => dropAddresses.includes(meta.contractAddress)),
          skipDuplicates: true,
        });
      } catch (err) {
        console.log(err);
      }
    };

    const client = getClient(chain);
    await syncContractLogs(
      client,
      EditionMetadataRenderer.abi as Abi,
      // @ts-ignore
      chainContracts.EDITION_METADATA_RENDERER.address,
      'EditionInitialized',
      fromBlock,
      processEditionInitialized,
    );
  }
};

// Sync the `Transfer` logs
export const syncTransfers = async () => {
  for (const chain of syncChains) {
    const chainContracts = contracts(chain);

    const erc721Drops = await prisma.createDropEvent.groupBy({
      by: ['editionContractAddress'],
      _min: {
        blockNumber: true,
      },
      where: {
        chain: ToDBChain(chain),
      },
    });

    const erc721DropAddresses = erc721Drops.map(
      (d) => d.editionContractAddress.toLowerCase() as Hex,
    );

    const synchedBlock = await getSynchedBlock('Transfer', ToDBChain(chain));

    const fromBlock = synchedBlock
      ? BigInt(synchedBlock)
      : BigInt(chainContracts.ZORA_NFT_CREATOR_PROXY.deployedBlock || 0);

    const processTransferLogs = async (logs: GetFilterLogsReturnType) => {
      const transferEvents = (
        await Promise.all(
          logs.map(async (log) => {
            try {
              const transactionHash = log.transactionHash;
              // @ts-ignore
              const tokenId = log.args.tokenId;
              // @ts-ignore
              const from = log.args.from.toLowerCase() as Hex;
              // @ts-ignore
              const to = log.args.to.toLowerCase() as Hex;

              const contractAddress = log.address.toLowerCase() as Hex;
              const blockNumber = log.blockNumber;

              return {
                transactionHash,
                blockNumber,
                contractAddress,
                tokenId,
                from,
                to,
                chain: ToDBChain(chain),
              };
            } catch (err) {
              console.log(err);
              return false;
            }
          }),
        )
      ).filter((meta) => meta !== false) as Prisma.TransferEventCreateManyInput[];

      try {
        await prisma.transferEvent.createMany({
          data: transferEvents,
          skipDuplicates: true,
        });
      } catch (err) {
        console.log(err);
      }
    };

    await syncContractLogs(
      getClient(chain),
      ERC721Drop.abi as Abi,
      erc721DropAddresses,
      'Transfer',
      fromBlock,
      processTransferLogs,
    );
  }
};

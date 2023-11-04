import prisma from '../../prisma';
import { Abi, GetFilterLogsReturnType, Hex, Transport, Chain, PublicClient } from 'viem';
import { ToDBChain, chains } from '../../utils';
import ZoraCreator1155Impl from './abi/ZoraCreator1155Impl.json';
import ZoraCreator1155FactoryImpl from './abi/ZoraCreator1155FactoryImpl.json';
import { syncContractLogs } from '../../lib/sync';
import contracts from './contracts';
import { getClient } from '../ethRpc';
import { getSynchedBlock } from '../../lib/syncInfo';
import { ZoraNFTMetadata } from '../../types';
import * as ipfs from '../../providers/ipfs';

const syncChains = [chains.zora, chains.optimism, chains.base];

export const syncSetupNewContractEvents = async () => {
  for (const chain of syncChains) {
    const synchedBlock = await getSynchedBlock('SetupNewContract', ToDBChain(chain));

    const processNewContracts = async (logs: GetFilterLogsReturnType) => {
      const data = await Promise.all(
        logs.map(async (log) => {
          // @ts-ignore
          const newContract = log.args.newContract.toLowerCase() as Hex;
          // @ts-ignore
          const contractURI = log.args.contractURI;

          const data: ZoraNFTMetadata = await ipfs.get(contractURI.replace('ipfs://', ''));

          // @ts-ignore
          const creator = log.args.creator;
          // @ts-ignore
          const defaultAdmin = log.args.defaultAdmin;

          return {
            newContract,
            contractURI,
            name: data.name || '',
            description: data.description || '',
            image: data.image || '',
            creator,
            defaultAdmin,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            chain: ToDBChain(chain),
          };
        }),
      );

      await prisma.setupNewContractEvent.createMany({
        data,
        skipDuplicates: true,
      });
    };

    const chainContracts = contracts(chain);

    const fromBlock = synchedBlock
      ? BigInt(synchedBlock)
      : BigInt(chainContracts.ERC1155_FACTORY_PROXY?.deployedBlock || 0);

    const client = getClient(chain);
    await syncContractLogs(
      client,
      ZoraCreator1155FactoryImpl as Abi,
      chainContracts.ERC1155_FACTORY_PROXY?.address.toLowerCase() as Hex,
      'SetupNewContract',
      fromBlock,
      processNewContracts,
    );
  }
};

export const syncPurchasedEvents = async () => {
  for (const chain of syncChains) {
    // Get synched token contracts
    const newContractEvents = await prisma.setupNewContractEvent.findMany({
      select: {
        newContract: true,
        blockNumber: true,
      },
    });
    const contractAddresses = newContractEvents.map((e) => e.newContract as Hex);
    const synchedBlock = await getSynchedBlock('Purchased', ToDBChain(chain));

    const earliestContractBlockNum = newContractEvents.map((e) => BigInt(e.blockNumber)).sort()[0];
    const fromBlock = synchedBlock ? BigInt(synchedBlock) : earliestContractBlockNum;

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
            chain: ToDBChain(chain),
          };
        }),
      );

      await prisma.purchasedEvent.createMany({
        data,
        skipDuplicates: true,
      });
    };

    const client = getClient(chain);
    await syncContractLogs(
      client,
      ZoraCreator1155Impl.abi as Abi,
      contractAddresses,
      'Purchased',
      fromBlock,
      processPurchases,
    );
  }
};

// syncPurchasedEvents();
// syncSetupNewContractEvents();

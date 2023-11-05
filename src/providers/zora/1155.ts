import prisma from '../../prisma';
import { Abi, GetFilterLogsReturnType, Hex } from 'viem';
import ZoraCreator1155Impl from './abi/ZoraCreator1155Impl.json';
import ZoraCreator1155FactoryImpl from './abi/ZoraCreator1155FactoryImpl.json';
import { syncContractLogs, syncLogs } from '../../lib/syncLogs';
import contracts from './contracts';
import { getClient } from '../ethRpc';
import { getSynchedBlock } from '../../lib/syncInfo';
import { ZoraNFTMetadata } from '../../types';
import * as ipfs from '../../providers/ipfs';
import { Chain } from '@prisma/client';
import * as chains from 'viem/chains';

export const syncSetupNewContractEvents = async () => {
  const synchedBlock = await getSynchedBlock('SetupNewContract', Chain.Zora);

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
          chain: Chain.Zora,
        };
      }),
    );

    await prisma.setupNewContractEvent.createMany({
      data,
      skipDuplicates: true,
    });
  };

  const chainContracts = contracts(chains.zora);

  const fromBlock = synchedBlock
    ? BigInt(synchedBlock)
    : BigInt(chainContracts.ERC1155_FACTORY_PROXY?.deployedBlock || 0);

  const client = getClient(chains.zora);
  await syncContractLogs(
    client,
    ZoraCreator1155FactoryImpl as Abi,
    chainContracts.ERC1155_FACTORY_PROXY.address.toLowerCase() as Hex,
    'SetupNewContract',
    fromBlock,
    processNewContracts,
  );
};

export const syncPurchasedEvents = async () => {
  const synchedBlock = await getSynchedBlock('Purchased', Chain.Zora);

  const chainContracts = contracts(chains.zora);

  const fromBlock = synchedBlock
    ? BigInt(synchedBlock)
    : BigInt(chainContracts.ERC1155_FACTORY_PROXY.deployedBlock || 0);

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

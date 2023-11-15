import { Chain, TransferEvent } from '@prisma/client';
import prisma from '../prisma';
import { Abi, GetFilterLogsReturnType, Hex } from 'viem';
import { getClient } from './ethRpc';
import { syncLogs } from '../lib/syncLogs';
import { ERC721Metadata } from '../types';
import { batchRun } from '../utils';
import ERC721 from './abi/ERC721.json';
import MirrorFactory from './abi/MirrorFactory.json';
import { AbiEvent } from 'abitype';

export const TRANSFER_EVENT = ERC721.find((abi) => abi.name === 'Transfer') as AbiEvent;
export const MIRROR_CLONE_DEPLOYED_EVENT = MirrorFactory.find(
  (abi) => abi.name === 'CloneDeployed',
) as AbiEvent;

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

  const contracts = await prisma.transferEvent.groupBy({
    where: {
      chain,
      to: {
        in: connectedAddress,
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
              const name = (await client.readContract({
                address: contract.contractAddress as Hex,
                abi: ERC721 as Abi,
                functionName: 'name',
              })) as string;

              return {
                name,
                contractAddress: contract.contractAddress,
              };
            } catch (err) {
              console.log(err);
            }
          }),
        )
      ).filter((data) => data) as ERC721Metadata[];

      await prisma.eRC721Metadata.createMany({
        data: nfts.map((data, i) => ({
          contractAddress: batch[i].contractAddress,
          name: data.name || '',
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
export const syncTransferEvents = async (
  chain: Chain,
  contractAddress: Hex[],
  event: AbiEvent,
  fromBlock: bigint,
) => {
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

  await syncLogs(chain, event, fromBlock, processTransfers, contractAddress, BigInt(1000));
};

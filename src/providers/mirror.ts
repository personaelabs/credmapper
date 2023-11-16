import { syncLogs } from '../lib/syncLogs';
import { MIRROR_FACTORY_CONTRACT } from '../contracts';
import { Chain } from '@prisma/client';
import { getClient } from './ethRpc';
import MirrorToken from './abi/MirrorToken.json';
import { Abi, Hex } from 'viem';
import prisma from '../prisma';
import { ArweaveTag } from '../types';
import axios from 'axios';

const query = (txId: string): string => `
query {
  transaction(id: "${txId}") {
    tags {
      name
      value
    }
  }
}
`;

const getTags = async (txId: string): Promise<ArweaveTag[]> => {
  const { data } = await axios.post('https://arweave.net/graphql', { query: query(txId) });
  return data.data.transaction.tags as ArweaveTag[];
};

export const syncMirrorPosts = async () => {
  const client = getClient(Chain.Optimism);
  const fromBlock = (
    await prisma.mirrorPost.findFirst({
      orderBy: {
        blockNumber: 'desc',
      },
    })
  )?.blockNumber;

  await syncLogs(
    Chain.Optimism,
    MIRROR_FACTORY_CONTRACT.event,
    fromBlock ? fromBlock : BigInt(MIRROR_FACTORY_CONTRACT.deployedBlock),
    async (logs) => {
      for (const log of logs) {
        // @ts-ignore
        const clone = log.args.clone.toLowerCase() as Hex;
        // @ts-ignore
        const owner = log.args.owner.toLowerCase() as Hex;
        const blockNumber = BigInt(log.blockNumber);

        const contentURI = (await client.readContract({
          address: clone,
          abi: MirrorToken as Abi,
          functionName: 'contentURI',
        })) as string;

        const tags = await getTags(contentURI);
        const originalContentDigest =
          tags.find((tag) => tag.name === 'Original-Content-Digest')?.value || '';

        const { data: mirrorPostData } = await axios.get(`https://arweave.net/${contentURI}`);

        await prisma.mirrorPost.createMany({
          skipDuplicates: true,
          data: [
            {
              body: mirrorPostData.content.body,
              title: mirrorPostData.content.title,
              timestamp: new Date(Number(mirrorPostData.content.timestamp) * 1000),
              owner: owner,
              digest: mirrorPostData.digest,
              imageURI: mirrorPostData.wnft.imageURI,
              description: mirrorPostData.wnft.description,
              proxyAddress: mirrorPostData.wnft.proxyAddress.toLowerCase(),
              symbol: mirrorPostData.wnft.symbol,
              arweaveTx: contentURI,
              originalContentDigest,
              chain: Chain.Optimism,
              blockNumber,
            },
          ],
        });
      }
    },
    MIRROR_FACTORY_CONTRACT.address,
    BigInt(10000),
  );
};

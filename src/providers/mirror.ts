import Arweave from 'arweave';
import { syncLogs } from '../lib/syncLogs';
import { MIRROR_FACTORY_CONTRACT } from '../contracts';
import { Chain } from '@prisma/client';
import { getClient } from './ethRpc';
import MirrorToken from './abi/MirrorToken.json';
import { Abi, Hex } from 'viem';
import prisma from '../prisma';
import { MirrorPostData } from '../types';

// Or to specify a gateway when running from NodeJS you might use
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

export const syncMirrorPosts = async () => {
  const client = getClient(Chain.Optimism);

  await syncLogs(
    Chain.Optimism,
    MIRROR_FACTORY_CONTRACT.event,
    BigInt(MIRROR_FACTORY_CONTRACT.deployedBlock),
    async (logs) => {
      for (const log of logs) {
        // @ts-ignore
        const clone = log.args.clone.toLowerCase() as Hex;
        // @ts-ignore
        const owner = log.args.owner.toLowerCase() as Hex;

        const contentURI = (await client.readContract({
          address: clone,
          abi: MirrorToken as Abi,
          functionName: 'contentURI',
        })) as string;

        /*
        const { tags } = await arweave.transactions.get(contentURI);
        const originalContentDigest =
          tags.find((tag) => atob(tag.name) === 'Original-Content-Digest')?.value || '';
          */

        const data = await arweave.transactions.getData(contentURI, { decode: true, string: true });
        const mirrorPostData = JSON.parse(data as string) as MirrorPostData;

        await prisma.mirrorPost.create({
          data: {
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
            originalContentDigest: '',
            chain: Chain.Optimism,
          },
        });
      }
    },
    MIRROR_FACTORY_CONTRACT.address,
    BigInt(10000),
  );
};

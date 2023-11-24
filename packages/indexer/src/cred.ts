import prisma from './prisma';
import { IndexedCast, SyncPackagedCredOptions } from './types';
import { getCasts } from './providers/farcaster';
import { Hex } from 'viem';
import { batchRun } from './utils';

// Fetch and save Lens posts filtered by the given options.
const syncPackagesLensPosts = async (options: SyncPackagedCredOptions) => {
  // TBD
};

// Fetch and save Farcaster casts filtered by the given options.
const syncPackagedCasts = async (options: SyncPackagedCredOptions) => {
  // Get Farcaster connected addresses that have many transactions
  const connectedAccountsWithManyTxs = (
    await prisma.connectedAddress.findMany({
      where: {
        address: {
          in: options.credibleAddresses,
        },
      },
    })
  ).map((account) => account);

  const fids = [...new Set(connectedAccountsWithManyTxs.map((address) => BigInt(address.fid)))];

  const casts = await getCasts({
    fids,
    fromDate: options.fromDate,
  });

  console.log(`Found ${casts.length} casts`);

  await batchRun(
    async (casts) => {
      const parsedCasts = (
        await Promise.all(
          casts.map(async (cast) => {
            try {
              const address = connectedAccountsWithManyTxs.find(
                (account) => BigInt(account.fid) === cast.fid,
              )?.address as Hex;

              return {
                fid: cast.fid,
                text: cast.text,
                address,
                timestamp: cast.timestamp,
                hash: `0x${cast.hash.toString('hex')}`,
                embeds: cast.embeds.map((embed) => embed.url),
                mentions: cast.mentions,
                mentionsPositions: cast.mentions_positions,
                parentUrl: cast.parent_url,
              } as IndexedCast;
            } catch (e) {
              console.log(e);
              return null;
            }
          }),
        )
      ).filter((cast) => cast) as IndexedCast[];

      for (const cast of parsedCasts) {
        const data = {
          id: cast.hash,
          text: cast.text,
          timestamp: cast.timestamp,
          embeds: cast.embeds,
          mentions: cast.mentions,
          mentionsPositions: cast.mentionsPositions,
          parentUrl: cast.parentUrl,
          hash: cast.hash,
        };

        await prisma.packagedCast.upsert({
          create: {
            ...data,
            user: {
              connect: {
                fid: Number(cast.fid),
              },
            },
          },
          update: data,
          where: {
            id: cast.hash,
          },
        });
      }
    },
    casts,
    'Parse casts',
    20,
  );
};

export const syncPackagesCred = async (options: SyncPackagedCredOptions) => {
  await syncPackagesLensPosts(options);
  await syncPackagedCasts(options);
};

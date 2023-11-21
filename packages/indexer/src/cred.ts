import prisma from './prisma';
import { ParsedCast, SyncPackagedCredOptions } from './types';
import { getCasts } from './providers/farcaster';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Cred, Venue } from '@prisma/client';
import { Hex } from 'viem';
import { batchRun } from './utils';

// Fetch and save Lens posts filtered by the given options.
const syncPackagesLensPosts = async (options: SyncPackagedCredOptions) => {
  // TBD
};

const getImageBytes = async (url: string): Promise<Buffer> => {
  const { data } = await axios.get<Buffer>(url, {
    responseType: 'arraybuffer',
  });
  return data;
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
    startDate: options.startDate,
    endDate: options.endDate,
  });

  console.log(`Found ${casts.length} casts`);

  await batchRun(
    async (casts) => {
      const parsedCasts = (
        await Promise.all(
          casts.map(async (cast) => {
            try {
              const castHash = cast.hash.toString('hex');
              const warpcastUrl = `https://warpcast.com/${cast.username}/0x${castHash}`;
              const result = await axios.get(warpcastUrl, {
                headers: {
                  'User-Agent': 'Telegrambot/1.0',
                },
              });
              const $ = cheerio.load(result.data);
              const ogImage = $('meta[property="og:image"]').attr('content');

              if (ogImage) {
                const address = connectedAccountsWithManyTxs.find(
                  (account) => BigInt(account.fid) === cast.fid,
                )?.address as Hex;

                return {
                  text: cast.text,
                  address,
                  timestamp: cast.timestamp,
                  hash: `0x${cast.hash.toString('hex')}`,
                  username: cast.username,
                  ogpImage: await getImageBytes(ogImage),
                  // Only acknowledge image embeds for now
                  images: await Promise.all(
                    cast.embeds
                      .filter((embed) => /(png|jpg|jpeg|svg)/.test(embed.url))
                      .map(async (embed) => await getImageBytes(embed.url)),
                  ),
                  parentUrl: cast.parent_url,
                };
              }
            } catch (e) {
              console.log(e);
              return null;
            }
          }),
        )
      ).filter((cast) => cast) as ParsedCast[];

      await prisma.packagedCast.createMany({
        data: parsedCasts.map((cast) => ({
          id: cast.hash,
          address: cast.address,
          cred: Cred.Over100Txs,
          venue: Venue.Farcaster,
          text: cast.text,
          timestamp: cast.timestamp,
          username: cast.username,
          ogpImage: cast.ogpImage,
          images: cast.images,
          parentUrl: cast.parentUrl,
          hash: cast.hash,
        })),
        skipDuplicates: true,
      });
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

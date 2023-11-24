import prisma from './prisma';
import { IndexedCast, SyncPackagedCredOptions } from './types';
import { getCasts } from './providers/farcaster';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Venue } from '@prisma/client';
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
                text: cast.text,
                address,
                timestamp: cast.timestamp,
                hash: `0x${cast.hash.toString('hex')}`,
                username: cast.username,
                displayName: cast.displayName,
                embeds: cast.embeds.map((embed) => embed.url),
                mentions: cast.mentions,
                mentionsPositions: cast.mentions_positions,
              };
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
          address: cast.address,
          cred: 'over_100txs',
          venue: Venue.Farcaster,
          text: cast.text,
          timestamp: cast.timestamp,
          username: cast.username,
          displayName: cast.displayName,
          embeds: cast.embeds,
          mentions: cast.mentions,
          mentionsPositions: cast.mentionsPositions,
          parentHash: cast.parentHash,
          hash: cast.hash,
        };

        await prisma.packagedCast.upsert({
          create: data,
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

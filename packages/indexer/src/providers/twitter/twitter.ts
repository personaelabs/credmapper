import 'dotenv/config';
import { Client } from 'twitter-api-sdk';
import { getLeaders } from './ethLeaderboard';
import prisma from '../../prisma';
import { getClient } from '../ethRpc';
import * as chains from 'viem/chains';
import { normalize } from 'viem/ens';
import { EthLeadersResponse } from '../../types';
import { sleep } from '../../utils';

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('TWITTER_BEARER_TOKEN is not defined');
}

const client = new Client(process.env.TWITTER_BEARER_TOKEN as string);

const getUserTweets = async (userId: string): Promise<string[]> => {
  const timeline = await client.tweets.usersIdTweets(userId);
  const tweetIds = timeline.data!.map((tweet) => tweet.id);
  return tweetIds;
};

const syncEthLeaders = async () => {
  const batch = 1000;
  const fromOffset = 0;
  const toOffset = 100000;

  const client = getClient(chains.mainnet);

  // Get the number of synched users

  for (let i = fromOffset; i < toOffset; i += batch) {
    const leaders = await getLeaders(i, batch);

    const users = (
      await Promise.all(
        leaders.map(async (user) => {
          try {
            const ensAddress = await client.getEnsAddress({
              name: normalize(user.ens),
            });

            if (!ensAddress) {
              return null;
            }

            return { ...user, ensAddress: ensAddress.toLowerCase() };
          } catch (e) {
            console.log(e);
            return null;
          }
        }),
      )
    ).filter((user) => user !== null) as (EthLeadersResponse['frens'][0] & {
      ensAddress: string;
    })[];

    await prisma.twitterUser.createMany({
      data: users.map((user) => ({
        id: user.id,
        handle: user.handle,
        name: user.name,
        ens: user.ens,
        ensAddress: user.ensAddress,
        followers: user.followers,
        verified: user.verified,
        ranking: user.ranking,
      })),
      skipDuplicates: true,
    });
  }
};

const syncTweets = async () => {
  // await syncEthLeaders();

  const authorIds = await prisma.twitterUser.findMany();

  const indexedAuthorTweets = await prisma.tweet.findMany({
    select: { authorId: true },
  });

  const indexedAuthorIds = indexedAuthorTweets.map((tweet) => tweet.authorId);

  for (const authorId of authorIds.filter((authorId) => !indexedAuthorIds.includes(authorId.id))) {
    try {
      console.log(`Syncing tweets for ${authorId.handle}`);
      const tweets = await getUserTweets(authorId.id);

      await prisma.tweet.createMany({
        data: tweets.map((tweet) => ({
          id: tweet,
          authorId: authorId.id,
        })),
        skipDuplicates: true,
      });
    } catch (err) {
      console.log(err);
    }

    await sleep(90000);
  }
};

syncTweets();

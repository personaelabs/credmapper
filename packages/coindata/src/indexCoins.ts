import fs from 'fs';
import { getCoinMarketCap } from './coingecko';
import { IndexedCoin, MarketCapDuration } from './types';
import { Hex } from 'viem';
import viem from './viem';
import { getContractDeploymentTx } from './etherscan';

const coins = JSON.parse(fs.readFileSync('ethCoins500M.json', 'utf8')) as {
  id: string;
  contract: Hex;
}[];

const indexedCoins: IndexedCoin[] = [];

const getCoinMarketCapDurations = async (coinId: string): Promise<MarketCapDuration[]> => {
  const marketChart = await getCoinMarketCap(coinId);

  const coinMarketcapDurations: MarketCapDuration[] = [];

  let startDate;
  let endDate;
  for (const marketCap of marketChart) {
    if (!startDate && marketCap[1] > 500000000) {
      startDate = new Date(marketCap[0]);
    } else if (startDate && marketCap[1] < 500000000) {
      endDate = new Date(marketCap[0]);
    }

    if (startDate && endDate) {
      coinMarketcapDurations.push({
        startDate,
        endDate,
      });

      startDate = undefined;
      endDate = undefined;
    }
  }

  if (startDate) {
    coinMarketcapDurations.push({
      startDate,
      endDate: new Date(),
    });
  }

  return coinMarketcapDurations;
};

const getContractDeployedBlock = async (address: Hex): Promise<bigint> => {
  const txHash = await getContractDeploymentTx(address);
  const tx = await viem.getTransaction({ hash: txHash });

  return tx.blockNumber;
};

const indexCoins = async () => {
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    console.log(`Getting market cap durations for ${coin.id} (${i}/${coins.length})`);

    const marketCapDurations = await getCoinMarketCapDurations(coin.id);
    const deployedBlock = await getContractDeployedBlock(coin.contract);

    indexedCoins.push({
      id: coin.id,
      contract: coin.contract,
      deployedBlock,
      marketCapDurations,
    });
  }

  fs.writeFileSync(
    'indexedCoins.json',
    JSON.stringify(
      indexedCoins.map((indexedCoin) => ({
        ...indexedCoin,
        deployedBlock: indexedCoin.deployedBlock.toString(),
      })),
      null,
      2,
    ),
  );
};

indexCoins();

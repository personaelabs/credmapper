import { getCoinMarketCap } from './coingecko';
import fs from 'fs';
import { CoinListResponse } from './types';

const getEthCoins = async () => {
  const allCoins = JSON.parse(fs.readFileSync('allCoins.json', 'utf8')) as CoinListResponse[];

  const ethCoins = allCoins.filter((coin) => coin.platforms?.['ethereum']);

  const coinsOverThreshold: any[] = [];

  for (let i = 0; i < ethCoins.length; i++) {
    console.log(`Coin ${i} of ${ethCoins.length}`);
    const coin = ethCoins[i];
    const marketChart = await getCoinMarketCap(coin.id);

    if (marketChart.some((marketCap) => marketCap[1] > 500000000)) {
      coinsOverThreshold.push({
        id: coin.id,
        contract: coin.platforms?.['ethereum'],
      });
    }
  }

  fs.writeFileSync('ethCoins500M.json', JSON.stringify(coinsOverThreshold, null, 2));
};

getEthCoins();

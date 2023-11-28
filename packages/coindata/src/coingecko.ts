export const getCoinMarketCap = async (coinId: string): Promise<number[][]> => {
  const url = `https://pro-api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=max&x_cg_pro_api_key=${process.env.COINGECKO_API_KEY}`;
  const data = await fetch(url);

  const marketCaps = (await data.json()).market_caps as number[][];
  return marketCaps;
};

import { getCoinMarketCap } from './coingecko';
import prisma from './prisma';
import { IndexedCoin, QueryTransfersResult } from './types';
import fs from 'fs';
import { findBlockNumberByTimestamp } from './utils';

const holdings = async (contractAddress: string, toBlock: bigint) => {
  const transfers = await prisma.$queryRaw<QueryTransfersResult[]>`
    WITH transfers_to AS (
	SELECT
		"to",
		SUM(CAST("value" AS numeric)) AS total_value_in
	FROM
		"ERC20TransferEvent"
    WHERE
		"contractAddress" = ${contractAddress} 
    AND "blockNumber" <= ${toBlock}
	GROUP BY
		"to"
    ),transfers_from AS (
        SELECT
            "from",
            SUM(CAST("value" AS numeric)) AS total_value_out
        FROM
            "ERC20TransferEvent"
        WHERE
    		"contractAddress" = ${contractAddress}
      AND "blockNumber" <= ${toBlock}
        GROUP BY
            "from"
    )
    SELECT
        transfers_to.total_value_in,
        transfers_from.total_value_out,
        transfers_to.to AS address
    FROM
        transfers_to
        LEFT JOIN transfers_from ON transfers_to.to = transfers_from.from
    `;

  const tokenHoldings = transfers.map((transfer) => {
    const totalValueIn = transfer.total_value_in || 0;
    const totalValueOut = transfer.total_value_out || 0;
    return {
      address: transfer.address,
      holdings: totalValueIn - totalValueOut,
    };
  });

  return tokenHoldings;
};

const indexTree = async () => {
  const indexedCoins = JSON.parse(fs.readFileSync('indexedCoins.json', 'utf8')) as IndexedCoin[];

  for (const indexedCoin of indexedCoins) {
    for (const marketCapDurations of indexedCoin.marketCapDurations) {
      const toBlock = await findBlockNumberByTimestamp(new Date(marketCapDurations.endDate));
      const holders = await holdings(indexedCoin.contract, toBlock);

      const holdersWithBalance = holders.filter((holder) => holder.holdings > 0);

      // TODO: Save the addresses
    }
  }
};

indexTree();

import prisma from '../prisma';
import { IndexedCoin, QueryTransfersResult } from '../types';
import { findBlockNumberByTimestamp } from '../utils';
import fixedSupplyTokens from './fixedSupplyTokens.json';
import indexedCoins from '../indexedCoins.json';

const holdersOverThresholdAtBlock = async (
  contractId: number,
  toBlock: bigint,
  threshold: bigint,
) => {
  const holders = await prisma.$queryRaw<QueryTransfersResult[]>`
    WITH transfers_to AS (
	SELECT
		"to",
		ROUND(SUM(CAST("value" AS numeric)) / 1e18) AS total_value_in
	FROM
		"ERC20TransferEvent2"
    WHERE
		"contractId" = ${contractId} 
    AND "blockNumber" <= ${toBlock}
	GROUP BY
		"to"
    ),transfers_from AS (
        SELECT
            "from",
            ROUND(SUM(CAST("value" AS numeric)) / 1e18) AS total_value_out
        FROM "ERC20TransferEvent2"
        WHERE
    		"contractId" = ${contractId}
      AND "blockNumber" <= ${toBlock}
        GROUP BY
            "from"
    )
    SELECT
        transfers_to.total_value_in,
        transfers_from.total_value_out,
        transfers_to.total_value_in - transfers_from.total_value_out AS holding,
        transfers_to.to AS address
    FROM
        transfers_to
        LEFT JOIN transfers_from ON transfers_to.to = transfers_from.from
    `;

  const holdersOverThreshold = holders.filter(
    (holder) => holder.holding && BigInt(holder.holding) > threshold / BigInt(1e18),
  );

  return holdersOverThreshold;
};

export const indexHistoricalWhales = async () => {
  const coinsWithFixedSupply = fixedSupplyTokens
    .map((token) => {
      const indexedCoin = indexedCoins.find((indexedCoin) => indexedCoin.dbId === token.contractId);
      if (!indexedCoin) {
        return null;
      }
      return {
        deployedBlock: BigInt(indexedCoin.deployedBlock),
        id: indexedCoin.id,
        dbId: indexedCoin.dbId,
        contract: indexedCoin.contract,
        marketCapDurations: indexedCoin.marketCapDurations.map((marketCapDuration) => ({
          startDate: new Date(marketCapDuration.startDate),
          endDate: new Date(marketCapDuration.endDate),
        })),
        totalSupply: token.totalSupply,
      };
    })
    .filter((coin) => coin !== null) as IndexedCoin[];

  for (let i = 0; i < coinsWithFixedSupply.length; i++) {
    console.log(`Get whales of ${i + 1}/${coinsWithFixedSupply.length}`);
    const indexedCoin = coinsWithFixedSupply[i];
    const coinTotalSupply = BigInt(indexedCoin.totalSupply as string);
    const threshold = coinTotalSupply / BigInt(100); // 1%

    for (let j = 0; j < indexedCoin.marketCapDurations.length; j++) {
      console.log(`Processing duration ${j + 1}/${indexedCoin.marketCapDurations.length}`);

      const marketCapDuration = indexedCoin.marketCapDurations[j];
      const toBlock = await findBlockNumberByTimestamp(new Date(marketCapDuration.endDate));
      const holders = await holdersOverThresholdAtBlock(indexedCoin.dbId, toBlock, threshold);

      if (holders.length > 0) {
        console.log(
          `Found ${holders.length} holders for ${indexedCoin.id} (${marketCapDuration.endDate})`,
        );
        await prisma.whale.createMany({
          data: holders.map((holder) => ({
            coinId: indexedCoin.dbId,
            address: holder.address,
            durationStart: marketCapDuration.startDate,
            durationEnd: marketCapDuration.endDate,
          })),
          skipDuplicates: true,
        });
      }
    }
  }
};

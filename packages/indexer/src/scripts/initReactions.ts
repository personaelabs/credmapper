import { fcReplicaClient } from '../providers/farcaster';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import prisma from '../prisma';
import { Reaction } from '@prisma/client';

interface ReactionResult {
  fid: string;
  target_hash: Buffer;
  reaction_type: number;
  timestamp: Date;
}

const FROM_DATE = new Date('2023-11-15T00:00:00.000Z');

const saveReactions = async () => {
  const indexedCasts = (
    await prisma.packagedCast.findMany({
      select: {
        id: true,
      },
    })
  ).map((cast) => cast.id);

  console.log('Fetching reactions...');
  const reactions = await fcReplicaClient.$queryRaw<ReactionResult[]>`
    SELECT
        target_hash,
        fid,
        reaction_type,
        "timestamp"
    FROM
	    reactions
    WHERE
        deleted_at IS NULL
        AND "timestamp" > ${FROM_DATE}
  `;

  console.log('Parsing reactions...');
  const records = reactions
    .map((data) => ({
      fid: data.fid,
      castId: `0x${data.target_hash.toString('hex')}`,
      reactionType: data.reaction_type,
      timestamp: data.timestamp.toISOString(),
    }))
    .filter((record) => indexedCasts.includes(record.castId));

  const csvWriter = createObjectCsvWriter({
    path: 'out.csv',
    header: [
      { id: 'fid', title: 'fid' },
      { id: 'castId', title: 'castId' },
      { id: 'reactionType', title: 'reactionType' },
      { id: 'timestamp', title: 'timestamp' },
    ],
  });

  // Write the records to the CSV file
  console.log('Writing to CSV...');
  await csvWriter.writeRecords(records);
  console.log('...Done');
};

const writeReactions = async () => {
  const records: Reaction[] = [];
  fs.createReadStream('out.csv')
    .pipe(csv())
    .on('data', (data) => records.push(data))
    .on('end', async () => {
      console.log('Writing to csv...');
      await prisma.reaction.createMany({
        data: records.map((result) => ({
          fid: BigInt(result.fid),
          castId: result.castId,
          reactionType: Number(result.reactionType),
          timestamp: result.timestamp,
        })),
        skipDuplicates: true,
      });
      console.log('...Done');
    });
};

const initReactions = async () => {
  await saveReactions();
  await writeReactions();
};

initReactions();

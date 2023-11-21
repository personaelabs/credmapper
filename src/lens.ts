import { BigQuery } from '@google-cloud/bigquery';
import { LensUsersQueryResult } from './types';
import { Hex } from 'viem';

const bigquery = new BigQuery();

const execQuery = async <T>(query: string): Promise<T[]> => {
  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    location: 'us-central1',
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  return rows;
};

export const getLensUsers = async (): Promise<LensUsersQueryResult[]> => {
  const query = `
    SELECT
      array_agg(transaction_executor) AS addresses,
      profile_id
    FROM
      lens-public-data.v2_polygon.profile_metadata
    WHERE transaction_executor != '0x0000000000000000000000000000000000000000'
    GROUP BY
      profile_id
    `;

  const result = await execQuery<LensUsersQueryResult>(query);

  return result.map((row) => ({
    ...row,
    addresses: row.addresses.map((address) => address.toLowerCase() as Hex),
  }));
};

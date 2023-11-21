import { BigQuery } from '@google-cloud/bigquery';
import {
  LensUsersQueryResult,
  GetLensPostQueryResult,
  ParsedLensPost,
  GetLensPostsOptions,
} from '../types';
import { Hex } from 'viem';

const bigquery = new BigQuery();

// Execute a query on the BigQuery database
const execQuery = async <T>(query: string): Promise<T[]> => {
  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    location: 'us-central1',
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  return rows;
};

// Get Lens users from the BigQuery database
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

// Get Lens posts from the BigQuery database filtered by the given options
export const getLensPosts = async (options: GetLensPostsOptions): Promise<ParsedLensPost[]> => {
  const startDate = `'${options.startDate.toISOString()}'`;
  const endDate = `'${options.endDate.toISOString()}'`;

  const query = `
    SELECT
        publication_id,
        profile_id,
        content_uri,
        tx_hash,
        block_timestamp
    FROM
       lens-public-data.v2_polygon.publication_record
    WHERE
        publication_type = 'POST'
        AND profile_id in (${options.profileIds.map((id) => `"${id}"`).join(',')})
        AND block_timestamp BETWEEN ${startDate}
        AND ${endDate}
    `;

  const result = await execQuery<GetLensPostQueryResult>(query);

  // Parse all posts
  const parsedPosts: ParsedLensPost[] = [];

  for (const row of result) {
    parsedPosts.push({
      publicationUrl: `https://hey.xyz/posts/${row.publication_id}`,
    });

    // We only send the `publicationUrl` for now, so the code below is commented out.
    /*
    const url = row.content_uri.includes('ar://')
      ? `https://arweave.net/${row.content_uri.replace('ar://', '')}`
      : row.content_uri;
    const { data: postData } = await axios.get<LensPostData>(url);

    if (postData.lens.content?.length > 100) {
      parsedPosts.push({
        publicationUrl: `https://hey.xyz/posts/${row.publication_id}`,
        // data: postData,
      });
    }
  */
  }

  return parsedPosts;
};

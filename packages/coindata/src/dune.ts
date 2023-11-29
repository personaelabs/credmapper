import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import indexedCoins from '../indexedCoins.json';

const DUNE_URL = 'https://api.dune.com/api/v1';
const DUNE_HEADERS = {
  'x-dune-api-key': process.env.DUNE_API_KEY,
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const poll = async (fn: () => Promise<boolean>, interval: number, timeout: number) => {
  const startTime = Date.now();
  const endTime = startTime + timeout;

  while (true) {
    console.log('Polling...');
    const isDone = await fn();
    if (isDone) {
      break;
    }

    await sleep(interval);

    if (Date.now() > endTime) {
      throw new Error('Timeout expired');
    }
  }
};

const executeQuery = async (
  queryId: string,
  params: { [key: string]: string },
): Promise<string> => {
  console.log(`Executing query ${queryId}`);
  const { data } = await axios.post(
    `${DUNE_URL}/query/${queryId}/execute`,
    {
      query_parameters: {
        ...params,
      },
    },
    {
      headers: DUNE_HEADERS,
    },
  );

  return data.execution_id;
};

const saveQueryResult = async (executionId: string, filename: string): Promise<any> => {
  const filePath = `data/${filename}.csv`;
  console.log(`Saving query result to ${filePath}`);

  const response = await axios.get(`${DUNE_URL}/execution/${executionId}/results/csv`, {
    headers: DUNE_HEADERS,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const getQueryStatus = async (executionId: string): Promise<string> => {
  const { data } = await axios.get(`${DUNE_URL}/execution/${executionId}/status`, {
    headers: DUNE_HEADERS,
  });

  return data.state;
};

export const duneQuery = async <R>(queryId: string, params: { [key: string]: string }) => {
  const executionId = await executeQuery(queryId, params);
  //  const executionId = '01HGCQP3DHQ0XM5DAP2HK4P7TQ';
  console.log(`Execution ID: ${executionId}`);

  const pollInternal = 10000;
  const queryTimeout = 180000; // 3 minutes
  await poll(
    async () => {
      const status = await getQueryStatus(executionId);
      if (status === 'QUERY_STATE_FAILED') {
        throw new Error('Query failed');
      }
      return status === 'QUERY_STATE_COMPLETED';
    },
    pollInternal,
    queryTimeout,
  );

  const outFile = `${params.contractAddress}-${params.toDate}`;
  await saveQueryResult(executionId, outFile);
};

const main = async () => {
  const QUERY_ID = '3239046'; // https://dune.com/queries/3239046
  for (const coin of indexedCoins) {
    for (const duration of coin.marketCapDurations) {
      await duneQuery(QUERY_ID, {
        toDate: (new Date(duration.endDate).getTime() / 1000).toString(),
        contractAddress: coin.contract,
      });
    }
  }
};

main();

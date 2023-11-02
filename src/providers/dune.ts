import 'dotenv/config';
import axios from 'axios';

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

const getQueryResult = async (executionId: string): Promise<any> => {
  const { data } = await axios.get(`${DUNE_URL}/execution/${executionId}/results`, {
    headers: DUNE_HEADERS,
  });

  return data;
};

const getQueryStatus = async (executionId: string): Promise<string> => {
  const { data } = await axios.get(`${DUNE_URL}/execution/${executionId}/status`, {
    headers: DUNE_HEADERS,
  });

  return data.state;
};

export const duneQuery = async <R>(
  queryId: string,
  params: { [key: string]: string },
): Promise<R[]> => {
  const executionId = await executeQuery(queryId, params);

  const pollInternal = 10000;
  const queryTimeout = 180000; // 3 minutes
  await poll(
    async () => {
      const status = await getQueryStatus(executionId);
      return status === 'QUERY_STATE_COMPLETED';
    },
    pollInternal,
    queryTimeout,
  );

  const result = await getQueryResult(executionId);
  return result.result.rows;
};

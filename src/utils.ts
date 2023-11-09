import * as _chains from 'viem/chains';

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(fn: () => Promise<T>, retries = 5, interval = 1000): Promise<T> => {
  let retried = 0;
  let error: any;
  while (true) {
    try {
      return await fn();
    } catch (_err: any) {
      if (retried >= retries) {
        error = _err;
        break;
      } else {
        retried++;
        await sleep(interval);
      }
    }
  }

  throw error;
};

export const batchRun = async <T>(
  fn: (params: T[]) => Promise<void>,
  params: T[],
  operationLabel: string = '',
  batchSize: number = 100,
) => {
  for (let i = 0; i < params.length; i += batchSize) {
    console.log(`${operationLabel} ${i}/${params.length}`);
    const batch = params.slice(i, i + batchSize);
    await fn(batch);
  }
};

export const bigIntMin = (...args: bigint[]) => {
  return args.reduce((min, b) => (b < min ? b : min));
};

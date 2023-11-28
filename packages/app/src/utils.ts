import * as SecureStore from 'expo-secure-store';

export const trimString = (str, maxLength) => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  } else {
    return str;
  }
};

export const poll = async <T>(
  fn: () => Promise<T>,
  interval: number,
  maxAttempts: number
): Promise<T> => {
  let attempts = 0;

  const executePoll = async (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => {
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      attempts++;

      if (attempts === maxAttempts) {
        return reject(new Error('Max attempts reached'));
      }

      setTimeout(() => executePoll(resolve, reject), interval);
    }
  };

  return new Promise(executePoll);
};

export const getSignerUuid = async () => {
  const signerUuid = await SecureStore.getItemAsync('signerUuid');
  return signerUuid;
};

export const getSignedInFid = async () => {
  const fid = await SecureStore.getItemAsync('fid');
  return fid;
};

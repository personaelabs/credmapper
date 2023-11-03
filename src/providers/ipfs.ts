import 'dotenv/config';
import axios from 'axios';
import { retry } from '../utils';

const auth = btoa(`${process.env.IPFS_API_KEY}:${process.env.IPFS_API_SECRET}`);
export const get = async <T>(cid: string): Promise<T> => {
  return await retry(
    async () => {
      const { data }: { data: object } = await axios.post(
        `https://ipfs.infura.io:5001/api/v0/cat`,
        {},
        {
          params: {
            arg: cid,
          },
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      return data as T;
    },
    3,
    500,
  );
};

// get('bafybeigy53kxc7mmbx7rip5kbt24mrgugh7wuaf4xucz6wprgcndls7ni4');

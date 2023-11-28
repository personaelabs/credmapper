import { useState, useCallback, useEffect } from 'react';
import { Account } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const useAccount = (fid: string | null) => {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    (async () => {
      if (fid) {
        const url = `${API_URL}/api/users/${fid}`;

        const result = await fetch(url);
        const data = await result.json();
        setAccount(data);
      }
    })();
  }, [fid]);

  return { account };
};

export default useAccount;

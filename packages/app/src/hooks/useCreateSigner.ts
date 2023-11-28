import { useState, useCallback, useEffect } from 'react';
import { RegisterSignedKeyResponse } from '../types';
import { poll } from '../utils';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const useCreateSigner = () => {
  const [fid, setFid] = useState<string | null>();
  const [response, setResponse] = useState<RegisterSignedKeyResponse | null>(
    null
  );

  const createSigner = useCallback(() => {
    (async () => {
      const url = `${API_URL}/api/signers/`;

      const result = await fetch(url, {
        method: 'POST',
      });
      const data = (await result.json()) as RegisterSignedKeyResponse;
      setResponse(data);

      Linking.openURL(data.signer_approval_url);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (response) {
        const { fid, signerUuid } = await poll(
          async () => {
            const url = `${API_URL}/api/signers/${response.signer_uuid}`;
            const result = await fetch(url);
            const data = await result.json();
            if (data.status === 'generated') {
              return { fid: data.fid, signerUuid: data.signer_uuid };
            } else {
              throw new Error('Signer not yet generated');
            }
          },
          1000,
          30
        );

        setFid(fid);
        await SecureStore.setItemAsync('signerUuid', signerUuid);
        await SecureStore.setItemAsync('fid', fid);
      }
    })();
  }, [response]);

  return {
    fid,
    createSigner,
  };
};

export default useCreateSigner;

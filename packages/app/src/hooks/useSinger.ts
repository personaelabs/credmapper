import { useState } from 'react';

const useSigner = () => {
  const [fid, setFid] = useState<string | null>();
  const [signerUuid, setSignerUuid] = useState();

  return {
    fid,
    signerUuid,
    setFid,
    setSignerUuid,
  };
};

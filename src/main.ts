import { duneQuery } from './providers/dune';
import { batchRun, getConnectedAddresses, getFIDs } from './providers/farcaster';
import { DuneTransactionRow } from './types';
import fs from 'fs';

const indexTraits = async () => {
  console.log('Getting fids');
  console.time('getFIDs');
  const fids = await getFIDs();
  console.timeEnd('getFIDs');

  console.log('Getting connected addresses');
  const connectedAddresses = (
    await batchRun(async (fid: number) => {
      const addresses = await getConnectedAddresses(fid);
      return { fid, addresses };
    }, fids)
  ).filter((r) => r.addresses.length > 0);

  fs.writeFileSync('connectedAddresses.json', JSON.stringify(connectedAddresses, null, 2));
};

indexTraits();

import { Hex } from 'viem';
import { getUserAddresses, indexUsers } from './providers/farcaster';
import { indexTxCount } from './providers/txCount';
import assignOver100Txs from './cred/assignOver100Txs';
import { indexCasts } from './casts';
import { assignScores } from './assignScores';

const sync = async () => {
  /*
  await indexUsers();
  const connectedAddresses = (await getUserAddresses())
    .map((r) => r.verified_addresses as Hex[])
    .flat();

  // Index data required to assign cred
  await indexTxCount(connectedAddresses.slice(0, 100));
  // Assign cred
  await assignOver100Txs();
  */
  // Index casts
  await indexCasts();

  // await assignScores();
};

sync();

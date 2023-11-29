import { indexTxCount } from './providers/txCount';
import assignOver100Txs from './cred/assignOver100Txs';
import { indexCasts } from './casts';
import { assignScores } from './assignScores';

const indexCred = async () => {
  // await indexUsers();

  await indexTxCount();
  await assignOver100Txs();

  // await indexAccounts(connectedAddresses);
  // await assignAccountInfo();

  await assignScores();

  // Index casts
  await indexCasts();
};

indexCred();

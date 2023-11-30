import { indexTxCount } from './providers/txCount';
import assignOver100Txs from './cred/assignOver100Txs';
import { indexCasts } from './casts';
import { assignScores } from './assignScores';
import assignERC20s from './cred/assignERC20';
import assignERC721s from './cred/assignERC721s';

const indexCred = async () => {
  // await indexUsers();

  // await indexTxCount();
  // await assignOver100Txs();

  await assignERC721s();

  // await indexAccounts(connectedAddresses);
  // await assignAccountInfo();

  await assignScores();

  // Index casts
  await indexCasts();
};

indexCred();

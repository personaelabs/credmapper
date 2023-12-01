import { indexTxCount } from './providers/txCount';
import assignOver100Txs from './cred/assignOver100Txs';
import { indexCasts } from './casts';
import { assignScores } from './assignScores';
import assignERC20s from './cred/assignERC20';
import assignERC721s from './cred/assignERC721s';
import { indexUsers } from './providers/farcaster';
import { indexERC721 } from './providers/erc721/erc721';

const indexCred = async () => {
  await indexUsers();

  // await indexTxCount();
  // await assignOver100Txs();

  await indexERC721();
  await assignERC721s();

  // await indexAccounts(connectedAddresses);
  // await assignAccountInfo();

  // Index casts
  await indexCasts();

  await assignScores();
};

indexCred();

import { Hex } from 'viem';
import { getAllAddresses, indexUsers } from './providers/farcaster';
import { indexTxCount } from './providers/txCount';
import assignOver100Txs from './cred/assignOver100Txs';
import { indexCasts } from './casts';
import { assignScores } from './assignScores';
import { indexERC721 } from './providers/erc721/erc721';
import assignERC721s from './cred/assignERC721s';
import { indexBeaconDepositors } from './providers/beaconDepositor/beaconDepositor';
import { indexAccounts } from './providers/account';
import assignAccountInfo from './cred/assignAccountInfo';

const sync = async () => {
  // await indexUsers();
  const connectedAddresses = (await getAllAddresses())
    .map((r) => r.verified_addresses as Hex[])
    .flat();

  // Index data required to assign cred
  await indexTxCount(connectedAddresses);
  await assignOver100Txs();

  // await indexBeaconDepositors();

  await indexERC721();
  await assignERC721s();

  await indexAccounts(connectedAddresses);
  await assignAccountInfo();

  await assignScores();

  // Index casts
  await indexCasts();
};

sync();

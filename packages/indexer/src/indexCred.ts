import { syncCasts, syncReactions } from './casts';
import assignERC721s from './cred/assignERC721s';
import { syncUsers } from './providers/farcaster';
import { syncERC721 } from './providers/erc721/erc721';
import { syncPoap } from './providers/poap/poap';
import assignPoap from './cred/assignPoap';
import { syncAccounts } from './providers/account';
import { syncBeaconDepositors } from './providers/beaconDepositor/beaconDepositor';

const indexCred = async () => {
  await syncAccounts();

  console.time('syncUsers');
  await syncUsers();
  console.timeEnd('syncUsers');

  await syncERC721();
  await assignERC721s();

  await syncPoap();
  await assignPoap();

  // sync casts
  console.time('syncCasts');
  await syncCasts();
  console.timeEnd('syncCasts');

  // sync reactions
  console.time('syncReactions');
  await syncReactions();
  console.timeEnd('syncReactions');

  console.time('syncBeaconDepositors');
  await syncBeaconDepositors();
  console.timeEnd('syncBeaconDepositors');
};

indexCred();

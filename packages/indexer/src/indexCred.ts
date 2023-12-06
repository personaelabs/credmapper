import { syncCasts, syncReactions } from './casts';
import assignERC721s from './cred/assignERC721s';
import { syncUsers } from './providers/farcaster';
import { syncERC721 } from './providers/erc721/erc721';
import { syncPoap } from './providers/poap/poap';
import assignPoap from './cred/assignPoap';
import { syncAccounts } from './providers/account';
// import { syncBeaconDepositors } from './providers/beaconDepositor/beaconDepositor';
// import assignOnChainSince2016 from './cred/assignOnChainSince2016';
// import assignBeaconDepositors from './cred/assignBeaconDepositors';

const indexCred = async () => {
  await syncAccounts();
  // await assignOnChainSince2016();

  console.time('syncUsers');
  await syncUsers();
  console.timeEnd('syncUsers');

  // await syncERC721();
  await assignERC721s();

  // await syncPoap();
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
  // await syncBeaconDepositors();
  // await assignBeaconDepositors();
  console.timeEnd('syncBeaconDepositors');
};

indexCred();

import { assignScores } from './assignScores';
import assignERC20s from './cred/assignERC20';
import assignERC721s from './cred/assignERC721s';
import assignPoap from './cred/assignPoap';
import { indexAccounts } from './providers/account';
import { indexBeaconDepositors } from './providers/beaconDepositor/beaconDepositor';
import { indexERC20 } from './providers/erc20/erc20';
import { indexERC721 } from './providers/erc721/erc721';
import { indexPoap } from './providers/poap/poap';
import { indexZoraCreators } from './providers/zora/zora';
import { formatBytes } from './utils';

const indexLogs = async () => {
  await indexERC721();
  await assignERC721s();

  await indexBeaconDepositors();

  // await indexAccounts();
  //  await assignAccountInfo();
  // await indexERC20();
  //  await indexZoraCreators();
  // await assignERC20s();
  // assignScores();
  // await indexPoap();
  // await assignPoap();
};

indexLogs();

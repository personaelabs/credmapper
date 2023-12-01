import { assignScores } from './assignScores';
import assignPoap from './cred/assignPoap';
import { indexERC20 } from './providers/erc20/erc20';
import { indexPoap } from './providers/poap/poap';
import { formatBytes } from './utils';

const indexLogs = async () => {
  // await indexBeaconDepositors();
  // await indexERC721();
  // await assignERC721s();
  //  await indexAccounts(connectedAddresses);
  //  await assignAccountInfo();

  await indexERC20();
  // await assignERC20s();
  // assignScores();
  // indexPoap();
  // assignPoap();
};

indexLogs();

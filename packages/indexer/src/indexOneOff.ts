import { indexBeaconDepositors } from './providers/beaconDepositor/beaconDepositor';
import { indexERC20 } from './providers/erc20/erc20';
import { indexERC721 } from './providers/erc721/erc721';

const indexOneOff = async () => {
  // Manually write the indexing function to run for the one off job
  await indexERC20();
  await indexBeaconDepositors();
  await indexERC721();
};

indexOneOff();

import { resyncAll } from './casts';
import { indexERC20 } from './providers/erc20/erc20';

const indexOneOff = async () => {
  // Manually write the indexing function to run for the one off job

  await indexERC20();
  /*
  await indexBeaconDepositors();
  await indexERC721();
  */
};

indexOneOff();

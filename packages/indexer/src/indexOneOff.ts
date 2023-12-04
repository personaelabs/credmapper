import { indexBeaconDepositors } from './providers/beaconDepositor/beaconDepositor';
import { indexERC721 } from './providers/erc721/erc721';

const indexOneOff = async () => {
  // Manually write the indexing function to run for the one off job
  await indexERC721();
  await indexBeaconDepositors();
};

indexOneOff();

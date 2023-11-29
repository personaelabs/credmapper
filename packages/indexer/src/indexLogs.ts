import { indexERC20 } from './providers/erc20/erc20';
import { formatBytes } from './utils';

const indexLogs = async () => {
  // await indexBeaconDepositors();

  // await indexERC721();
  // await assignERC721s();

  //  await indexAccounts(connectedAddresses);
  //  await assignAccountInfo();

  // Log memory usage
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Heap Used: ${formatBytes(memoryUsage.heapUsed)}`);
  }, 5000);

  await indexERC20();
  // await assignERC20s();
};

indexLogs();
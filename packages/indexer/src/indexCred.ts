import chalk from 'chalk';
import { syncCasts, syncReactions } from './casts';
import {
  assignOver1000Txs,
  assignOver10000Txs,
  assignOnchainSince2016,
  assignBeaconDepositOver256Eth,
  assignSuperRareOgs,
  assignBeaconGenesisDepositors,
  assignNouns,
  assignMilady,
  assignPurple,
  assignAzuki,
  assignPudgyPenguins,
} from './lib/assignCredJobs';
import { syncUsers } from './providers/farcaster';

// List of jobs that index data and assign cred to Farcaster users
const assignCredJobs = [
  assignOver1000Txs,
  assignOver10000Txs,
  assignOnchainSince2016,
  assignBeaconDepositOver256Eth,
  assignSuperRareOgs,
  assignBeaconGenesisDepositors,
  assignNouns,
  assignMilady,
  assignPurple,
  assignPudgyPenguins,
  assignAzuki,
];

// List of jobs that index data from Farcaster
const farcasterSyncJobs = [syncUsers, syncCasts, syncReactions];

const indexCred = async () => {
  const startTime = Date.now();
  for (let i = 0; i < farcasterSyncJobs.length; i++) {
    const farcasterSyncJob = farcasterSyncJobs[i];
    console.log(
      chalk.blue(`(${i + 1}/${farcasterSyncJobs.length}) Running ${farcasterSyncJob.name}`),
    );
    await farcasterSyncJob();
  }

  for (let i = 0; i < assignCredJobs.length; i++) {
    const assignCredJob = assignCredJobs[i];
    console.log(chalk.blue(`${i + 1}/${assignCredJobs.length} Running ${assignCredJob.name}`));
    try {
      await assignCredJob();
    } catch (err) {
      console.log(chalk.red(`Error running ${assignCredJob.name}`));
      console.log(err);
    }
  }

  const endTime = Date.now();
  const elapsedSeconds = Math.round((endTime - startTime) / 1000);
  console.log(chalk.green(`Done! Took: ${elapsedSeconds}s`));
};

indexCred();

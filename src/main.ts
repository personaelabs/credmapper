import { batchRun, getConnectedAddresses, getFIDs, getUserProfile } from './providers/farcaster';
import prisma from './prisma';
import { syncCreatedDrops, syncMetadataUpdated } from './providers/zora';
import { linkDrops } from './lib/sync';

const syncUsers = async () => {
  const latestHubEvent = await prisma.hubEvent.findFirst({
    orderBy: { timestamp: 'desc' },
  });

  if (!latestHubEvent) {
    const fids = await getFIDs();

    await batchRun(async (fids: number[]) => {
      const users = await Promise.all(
        fids.map(async (fid) => {
          const profile = await getUserProfile(fid);

          return {
            fid,
            fcUsername: profile?.username,
            displayName: profile?.displayName,
            pfp: profile?.pfp,
            bio: profile?.bio,
          };
        }),
      );

      console.log(`Saving users...`);
      await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
      });
    }, fids);
  } else {
    // TODO: Sync new users by going through the hub events
  }
};

const syncConnectedAddresses = async () => {
  const latestHubEvent = await prisma.hubEvent.findFirst({
    orderBy: { timestamp: 'desc' },
  });

  if (!latestHubEvent) {
    const users = await prisma.user.findMany({
      select: {
        fid: true,
      },
    });
    const fids = users.map((u) => u.fid);

    await batchRun(async (fids: number[]) => {
      const connectedAddresses = (
        await Promise.all(
          fids.map(async (fid) => {
            const addresses = await getConnectedAddresses(fid);
            return addresses.map((address) => ({
              userFid: fid,
              address,
            }));
          }),
        )
      ).flat();

      // Link drops to creators
      for (const connectedAddress of connectedAddresses) {
        await linkDrops(connectedAddress.address);
      }

      console.log(`Saving connected addresses...`);
      await prisma.connectedAddress.createMany({
        data: connectedAddresses,
        skipDuplicates: true,
      });
    }, fids);
  } else {
    // TODO: Sync new users by going through the hub events
  }
};

const sync = async () => {
  console.log(`Syncing...`);

  console.log(`Syncing users...`);
  await syncUsers();

  console.log(`Syncing connected addresses...`);
  await syncConnectedAddresses();

  console.log(`Syncing new drops...`);
  await syncCreatedDrops();

  console.log(`Syncing metadata updates...`);
  await syncMetadataUpdated();
};

sync();

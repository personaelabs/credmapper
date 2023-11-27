import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';

// A client that points to the Farcaster replica database
export const fcReplicaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.FARCASTER_REPLICA_DB_URL,
    },
  },
});

export const getUserAddresses = async (fid: number): Promise<string[]> => {
  const addresses = (
    await fcReplicaClient.$queryRaw<{ verified_addresses: string[] }[]>`
      SELECT
          "verified_addresses"
      FROM
        profile_with_addresses
      WHERE
        fid = ${fid}
   `
  )
    .map((r) => r.verified_addresses as string[])
    .flat();

  return addresses;
};

import prisma from './prisma';
import { IndexedRecord, Mint } from './types';
import fs from 'fs';
import { getConnectedAddresses, getUsers } from './providers/farcaster';

const MAX_RECORD_BYTES = 10000;

export const indexMinters = async () => {
  // Get all Farcaster users with at least one mint
  const users = await getUsers();
  console.log(`Found ${users.length} Farcaster users`);
  const fcMinters = await getConnectedAddresses();
  console.log(`Found ${fcMinters.length} Farcaster minters`);

  const minterAddresses = fcMinters.map((row) => row.addresses.map((r) => r.address)).flat();

  // Get all contracts that have been minted to
  const purchases = await prisma.purchasedEvent.findMany({
    where: {
      minter: {
        in: minterAddresses,
      },
    },
  });

  console.log(`Found ${purchases.length} purchases`);

  const transfers = await prisma.transferEvent.findMany({
    where: {
      to: {
        in: minterAddresses,
      },
      from: '0x0000000000000000000000000000000000000000',
    },
  });

  const mintedContracts = [
    ...new Set([
      ...purchases.map((p) => p.contractAddress),
      ...transfers.map((t) => t.contractAddress),
    ]),
  ];

  console.log(`Found ${mintedContracts.length} minted contracts`);

  // Get all metadata for 1155 contracts
  const erc1155Metadata = await prisma.eRC1155Token.findMany({
    where: {
      contractAddress: {
        in: mintedContracts,
      },
    },
  });

  const erc721Metadata = await prisma.eRC721Metadata.findMany({
    where: {
      contractAddress: {
        in: mintedContracts,
      },
    },
  });

  // Transform the data into the format that can be indexed by Algolia
  const indexedRecords: IndexedRecord[] = [];

  for (const user of fcMinters) {
    const userMints: Mint[] = [];
    for (const address of user.addresses) {
      const addressPurchases = purchases.filter((p) => p.minter === address.address);

      for (const purchase of addressPurchases) {
        const erc1155Meta = erc1155Metadata.find(
          (meta) =>
            meta.contractAddress === purchase.contractAddress && meta.tokenId === purchase.tokenId,
        );

        if (erc1155Meta) {
          // If this is an ERC1155 contract, we can get the drop title and image from the metadata
          userMints.push({
            title: erc1155Meta.name,
          });
        }
      }

      const addressTransfers = transfers.filter((t) => t.to === address.address);
      for (const transfer of addressTransfers) {
        const erc721Meta = erc721Metadata.find(
          (meta) => meta.contractAddress === transfer.contractAddress,
        );

        if (erc721Meta) {
          // If this is an ERC721 contract, we can get the drop title and image from the metadata
          userMints.push({
            title: erc721Meta.name,
          });
        }
      }
    }

    if (userMints.length > 0) {
      const profile = users.find((u) => u.fid === user.fid)!;

      const userRecord = {
        fid: user.fid.toString(),
        pfp: profile.pfp,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        mints: userMints,
      };

      const recordSize = Buffer.from(JSON.stringify(userRecord), 'utf8').byteLength;

      if (recordSize > MAX_RECORD_BYTES) {
        console.log(
          `Skipping ${userRecord.username} because record size it exceed size limit ${recordSize}/${MAX_RECORD_BYTES}`,
        );
        if (userRecord.username === 'jacob') {
          console.log(userRecord);
        }
      } else {
        indexedRecords.push(userRecord);
      }
    }
  }

  // Write the data to a JSON file
  const json = JSON.stringify(indexedRecords, null, 2);
  fs.writeFileSync('./index.json', json);
};

indexMinters();

import prisma from './prisma';
import { IndexedRecord, Mint, ZoraDrop } from './types';
import fs from 'fs';
import { Hex } from 'viem';

const MAX_RECORD_BYTES = 10000;

export const indexMinters = async () => {
  // Get all Farcaster users with at least one mint
  const fcMinters = await prisma.user.findMany({
    include: {
      connectedAddresses: {
        include: {
          purchases: true,
        },
      },
    },
    where: {
      connectedAddresses: {
        some: {
          purchases: {
            some: {},
          },
        },
      },
    },
  });

  // Get all contracts that have been minted to
  const mintedContracts = [
    ...new Set(
      fcMinters
        .map((user) =>
          user.connectedAddresses
            .map((address) => [...address.purchases.map((purchase) => purchase.contractAddress)])
            .flat(),
        )
        .flat(),
    ),
  ];

  // Get all metadata for 1155 contracts
  const erc1155Metadata = await prisma.eRC1155Token.findMany({
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
    for (const address of user.connectedAddresses) {
      for (const purchase of address.purchases) {
        const erc1155Meta = erc1155Metadata.find(
          (meta) => meta.contractAddress === purchase.contractAddress,
        );

        if (erc1155Meta) {
          // If this is an ERC1155 contract, we can get the drop title and image from the metadata
          userMints.push({
            contractAddress: purchase.contractAddress as Hex,
            minter: purchase.minter as Hex,
            title: erc1155Meta.name,
            image: erc1155Meta.image,
            tokenId: purchase.tokenId.toString(),
            chain: purchase.chain,
          });
        }
      }
    }

    if (userMints.length > 0) {
      const userRecord = {
        fid: user.fid.toString(),
        pfp: user.pfp || '',
        username: user.fcUsername || '',
        displayName: user.displayName || '',
        bio: user.bio || '',
        mints: userMints,
      };

      const recordSize = Buffer.from(JSON.stringify(userRecord), 'utf8').byteLength;

      if (recordSize > MAX_RECORD_BYTES) {
        console.log(
          `Skipping ${userRecord.username} because record size it exceed size limit ${recordSize}/${MAX_RECORD_BYTES}`,
        );
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

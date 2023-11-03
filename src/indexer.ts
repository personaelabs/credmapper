import { isConstructorDeclaration } from 'typescript';
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
          transfers: {
            where: {
              from: '0x0000000000000000000000000000000000000000',
            },
          },
        },
      },
    },
    where: {
      connectedAddresses: {
        some: {
          transfers: {
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
            .map((address) => address.transfers.map((transfer) => transfer.contractAddress))
            .flat(),
        )
        .flat(),
    ),
  ];

  // Get all metadata fr Drops
  const dropsMeta = await prisma.metadataUpdateEvent.findMany({
    where: {
      contractAddress: {
        in: mintedContracts,
      },
    },
    orderBy: {
      blockNumber: 'desc',
    },
  });

  // get all metadata for Editions
  const editionsMeta = await prisma.editionInitializedEvent.findMany({
    where: {
      contractAddress: {
        in: mintedContracts,
      },
    },
    orderBy: {
      blockNumber: 'desc',
    },
  });

  // Transform the data into the format that can be indeed by Algolia
  const indexedRecords: IndexedRecord[] = [];
  for (const user of fcMinters) {
    const userMints: Mint[] = [];
    for (const address of user.connectedAddresses) {
      for (const transfer of address.transfers) {
        const contractAddress = transfer.contractAddress;
        const dropMeta = dropsMeta.find((drop) => drop.contractAddress === contractAddress);
        const editionMeta = editionsMeta.find(
          (edition) => edition.contractAddress === contractAddress,
        );

        // If this is a drop, we can get the drop title and image from the metadata
        if (dropMeta) {
          userMints.push({
            contractAddress: transfer.contractAddress as Hex,
            minter: transfer.to as Hex,
            dropTitle: dropMeta.name,
            dropImage: dropMeta.image,
            tokenId: transfer.tokenId.toString(),
            chain: transfer.chain,
          });
        } else if (editionMeta) {
          const description = editionMeta.description;
          if (description.length > 25) {
            console.log(`Skipping ${editionMeta.contractAddress} because description is too long`);
          } else {
            // If this is an edition, we can get the drop title and image from the edition metadata
            userMints.push({
              contractAddress: transfer.contractAddress as Hex,
              minter: transfer.to as Hex,
              dropTitle: editionMeta.description, // There is no name field so we use the description
              dropImage: editionMeta.imageURI,
              tokenId: transfer.tokenId.toString(),
              chain: transfer.chain,
            });
          }
        } else {
          // console.log(`No metadata found for ${transfer.contractAddress}`);
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

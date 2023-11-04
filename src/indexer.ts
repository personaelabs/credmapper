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
          purchases: true,
        },
      },
    },
    where: {
      connectedAddresses: {
        some: {
          transfers: {
            some: {},
          },
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
            .map((address) => [
              ...address.transfers.map((transfer) => transfer.contractAddress),
              ...address.purchases.map((purchase) => purchase.contractAddress),
            ])
            .flat(),
        )
        .flat(),
    ),
  ];

  console.log(`Found ${mintedContracts.length} minted contracts`);

  // Get all metadata fr ERC721 Drops
  const erc721Meta = await prisma.metadataUpdateEvent.findMany({
    where: {
      contractAddress: {
        in: mintedContracts,
      },
    },
    orderBy: {
      blockNumber: 'desc',
    },
  });

  // Get all metadata fr ERC721 editions
  const erc721EditionsMeta = await prisma.editionInitializedEvent.findMany({
    where: {
      contractAddress: {
        in: mintedContracts,
      },
    },
    orderBy: {
      blockNumber: 'desc',
    },
  });

  // Get all metadata for 1155 contracts
  const erc1155Metadata = await prisma.setupNewContractEvent.findMany({
    where: {
      newContract: {
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
      // 1. Process all ERC721 transfers
      for (const transfer of address.transfers) {
        const contractAddress = transfer.contractAddress;

        // Search for the metadata for this contract
        const meta = erc721Meta.find((drop) => drop.contractAddress === contractAddress);
        const editionMeta = erc721EditionsMeta.find(
          (edition) => edition.contractAddress === contractAddress,
        );
        const erc1155Meta = erc1155Metadata.find((meta) => meta.newContract === contractAddress);

        // If this is a drop, we can get the drop title and image from the metadata
        if (meta) {
          userMints.push({
            contractAddress: transfer.contractAddress as Hex,
            minter: transfer.to as Hex,
            title: meta.name,
            image: meta.image,
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
              title: editionMeta.description, // There is no name field so we use the description
              image: editionMeta.imageURI,
              tokenId: transfer.tokenId.toString(),
              chain: transfer.chain,
            });
          }
        } else if (erc1155Meta) {
          // If this is an ERC1155 contract, we can get the drop title and image from the metadata
          userMints.push({
            contractAddress: transfer.contractAddress as Hex,
            minter: transfer.to as Hex,
            title: erc1155Meta.name,
            image: erc1155Meta.image,
            tokenId: transfer.tokenId.toString(),
            chain: transfer.chain,
          });
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

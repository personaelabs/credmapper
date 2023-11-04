-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('Ethereum', 'Zora', 'Base', 'Optimism', 'PGN');

-- CreateTable
CREATE TABLE "CreateDropEvent" (
    "transactionHash" TEXT NOT NULL,
    "editionContractAddress" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "creator" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chain" "Chain" NOT NULL DEFAULT 'Zora',

    CONSTRAINT "CreateDropEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "MetadataUpdateEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenURI" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chain" "Chain" NOT NULL DEFAULT 'Zora',

    CONSTRAINT "MetadataUpdateEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "EditionInitializedEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageURI" TEXT NOT NULL,
    "animationURI" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chain" "Chain" NOT NULL DEFAULT 'Zora',

    CONSTRAINT "EditionInitializedEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "TransferEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chain" "Chain" NOT NULL DEFAULT 'Zora',
    "connectedAddress" TEXT,

    CONSTRAINT "TransferEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "SetupNewContractEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "newContract" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "defaultAdmin" TEXT NOT NULL,
    "contractURI" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetupNewContractEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "PurchasedEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,

    CONSTRAINT "PurchasedEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "User" (
    "fid" INTEGER NOT NULL,
    "fcUsername" TEXT,
    "displayName" TEXT,
    "pfp" TEXT,
    "bio" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("fid")
);

-- CreateTable
CREATE TABLE "ConnectedAddress" (
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userFid" INTEGER,

    CONSTRAINT "ConnectedAddress_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "HubEvent" (
    "id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncInfo" (
    "eventName" TEXT NOT NULL,
    "synchedBlock" BIGINT NOT NULL,
    "chain" "Chain" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncInfo_pkey" PRIMARY KEY ("eventName","chain")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreateDropEvent_editionContractAddress_key" ON "CreateDropEvent"("editionContractAddress");

-- AddForeignKey
ALTER TABLE "TransferEvent" ADD CONSTRAINT "TransferEvent_connectedAddress_fkey" FOREIGN KEY ("connectedAddress") REFERENCES "ConnectedAddress"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedAddress" ADD CONSTRAINT "ConnectedAddress_userFid_fkey" FOREIGN KEY ("userFid") REFERENCES "User"("fid") ON DELETE SET NULL ON UPDATE CASCADE;

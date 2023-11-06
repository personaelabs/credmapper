-- CreateTable
CREATE TABLE "TransferEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "ERC721Token" (
    "contractAddress" TEXT NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "animation" TEXT,
    "chain" "Chain" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ERC721Token_contractAddress_tokenId_key" ON "ERC721Token"("contractAddress", "tokenId");

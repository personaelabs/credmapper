-- CreateTable
CREATE TABLE "ERC1155Token" (
    "contractAddress" TEXT NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "animation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ERC1155Token_contractAddress_tokenId_key" ON "ERC1155Token"("contractAddress", "tokenId");

/*
  Warnings:

  - You are about to drop the `ERC721Contract` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ERC721Contract";

-- CreateTable
CREATE TABLE "ERC721Metadata" (
    "contractAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ERC721Metadata_pkey" PRIMARY KEY ("contractAddress")
);

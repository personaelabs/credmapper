/*
  Warnings:

  - You are about to drop the column `connectedAddress` on the `ERC1155Token` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ERC1155Token" DROP CONSTRAINT "ERC1155Token_connectedAddress_fkey";

-- AlterTable
ALTER TABLE "ERC1155Token" DROP COLUMN "connectedAddress";

-- AddForeignKey
ALTER TABLE "PurchasedEvent" ADD CONSTRAINT "PurchasedEvent_contractAddress_tokenId_fkey" FOREIGN KEY ("contractAddress", "tokenId") REFERENCES "ERC1155Token"("contractAddress", "tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;

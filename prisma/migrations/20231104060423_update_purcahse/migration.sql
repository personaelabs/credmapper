/*
  Warnings:

  - Changed the type of `tokenId` on the `PurchasedEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PurchasedEvent" DROP COLUMN "tokenId",
ADD COLUMN     "tokenId" BIGINT NOT NULL;

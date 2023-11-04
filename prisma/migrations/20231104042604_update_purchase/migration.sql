/*
  Warnings:

  - Added the required column `contractAddress` to the `PurchasedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minter` to the `PurchasedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `PurchasedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `PurchasedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `PurchasedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchasedEvent" ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "minter" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "tokenId" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;

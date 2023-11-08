/*
  Warnings:

  - You are about to drop the column `connectedAddress` on the `PurchasedEvent` table. All the data in the column will be lost.
  - You are about to drop the column `connectedAddress` on the `TransferEvent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchasedEvent" DROP CONSTRAINT "PurchasedEvent_connectedAddress_fkey";

-- DropForeignKey
ALTER TABLE "TransferEvent" DROP CONSTRAINT "TransferEvent_connectedAddress_fkey";

-- AlterTable
ALTER TABLE "PurchasedEvent" DROP COLUMN "connectedAddress";

-- AlterTable
ALTER TABLE "TransferEvent" DROP COLUMN "connectedAddress";

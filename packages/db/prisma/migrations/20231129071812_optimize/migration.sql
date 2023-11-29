/*
  Warnings:

  - You are about to drop the column `chain` on the `ERC20TransferEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ERC20TransferEvent" DROP COLUMN "chain";

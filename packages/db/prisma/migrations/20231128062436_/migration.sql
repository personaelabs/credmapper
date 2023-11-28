/*
  Warnings:

  - Added the required column `logIndex` to the `ERC20TransferEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionIndex` to the `ERC20TransferEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ERC20TransferEvent" ADD COLUMN     "logIndex" BIGINT NOT NULL,
ADD COLUMN     "transactionIndex" BIGINT NOT NULL;

/*
  Warnings:

  - You are about to alter the column `logIndex` on the `ERC20TransferEvent` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `SmallInt`.
  - You are about to alter the column `transactionIndex` on the `ERC20TransferEvent` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "ERC20TransferEvent" ALTER COLUMN "logIndex" SET DATA TYPE SMALLINT,
ALTER COLUMN "transactionIndex" SET DATA TYPE INTEGER;

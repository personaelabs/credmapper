/*
  Warnings:

  - The primary key for the `ERC20TransferEvent2` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `transactionHash` on the `ERC20TransferEvent2` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[blockNumber,transactionIndex]` on the table `ERC20TransferEvent2` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ERC20TransferEvent2" DROP CONSTRAINT "ERC20TransferEvent2_pkey",
DROP COLUMN "transactionHash",
ALTER COLUMN "logIndex" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ERC20TransferEvent2_blockNumber_transactionIndex_key" ON "ERC20TransferEvent2"("blockNumber", "transactionIndex");

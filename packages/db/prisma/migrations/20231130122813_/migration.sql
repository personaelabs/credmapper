/*
  Warnings:

  - You are about to drop the column `transactionHash` on the `PoapEventTokenEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `PoapTransferEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[blockNumber,transactionIndex]` on the table `PoapEventTokenEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[blockNumber,transactionIndex]` on the table `PoapTransferEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PoapEventTokenEvent_transactionHash_logIndex_key";

-- DropIndex
DROP INDEX "PoapTransferEvent_transactionHash_logIndex_key";

-- AlterTable
ALTER TABLE "PoapEventTokenEvent" DROP COLUMN "transactionHash",
ALTER COLUMN "logIndex" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "PoapTransferEvent" DROP COLUMN "transactionHash",
ALTER COLUMN "logIndex" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PoapEventTokenEvent_blockNumber_transactionIndex_key" ON "PoapEventTokenEvent"("blockNumber", "transactionIndex");

-- CreateIndex
CREATE UNIQUE INDEX "PoapTransferEvent_blockNumber_transactionIndex_key" ON "PoapTransferEvent"("blockNumber", "transactionIndex");

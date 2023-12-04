/*
  Warnings:

  - The primary key for the `TransferEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `transactionHash` on the `TransferEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[blockNumber,transactionIndex]` on the table `TransferEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `logIndex` to the `TransferEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionIndex` to the `TransferEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransferEvent" DROP CONSTRAINT "TransferEvent_pkey",
DROP COLUMN "transactionHash",
ADD COLUMN     "logIndex" INTEGER NOT NULL,
ADD COLUMN     "transactionIndex" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TransferEvent_blockNumber_transactionIndex_key" ON "TransferEvent"("blockNumber", "transactionIndex");

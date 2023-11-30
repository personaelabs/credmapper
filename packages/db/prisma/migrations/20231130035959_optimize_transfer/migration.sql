/*
  Warnings:

  - You are about to drop the column `chain` on the `TransferEvent` table. All the data in the column will be lost.
  - You are about to drop the column `contractAddress` on the `TransferEvent` table. All the data in the column will be lost.
  - Changed the type of `tokenId` on the `TransferEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TransferEvent" DROP COLUMN "chain",
DROP COLUMN "contractAddress",
ADD COLUMN     "contractId" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "tokenId",
ADD COLUMN     "tokenId" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "TransferEvent_from_idx" ON "TransferEvent"("from");

-- CreateIndex
CREATE INDEX "TransferEvent_contractId_idx" ON "TransferEvent"("contractId");

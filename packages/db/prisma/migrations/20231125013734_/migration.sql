/*
  Warnings:

  - Changed the type of `chain` on the `TransferEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TransferEvent" DROP COLUMN "chain",
ADD COLUMN     "chain" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Chain";

/*
  Warnings:

  - Added the required column `chain` to the `PurchasedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chain` to the `SetupNewContractEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchasedEvent" ADD COLUMN     "chain" "Chain" NOT NULL;

-- AlterTable
ALTER TABLE "SetupNewContractEvent" ADD COLUMN     "chain" "Chain" NOT NULL;

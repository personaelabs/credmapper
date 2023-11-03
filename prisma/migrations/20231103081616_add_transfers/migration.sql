-- AlterTable
ALTER TABLE "TransferEvent" ADD COLUMN     "connecttedTo" TEXT;

-- AddForeignKey
ALTER TABLE "TransferEvent" ADD CONSTRAINT "TransferEvent_connecttedTo_fkey" FOREIGN KEY ("connecttedTo") REFERENCES "ConnectedAddress"("address") ON DELETE SET NULL ON UPDATE CASCADE;

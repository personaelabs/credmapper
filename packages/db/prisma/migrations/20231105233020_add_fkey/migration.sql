-- AlterTable
ALTER TABLE "TransferEvent" ADD COLUMN     "connectedAddress" TEXT;

-- AddForeignKey
ALTER TABLE "TransferEvent" ADD CONSTRAINT "TransferEvent_connectedAddress_fkey" FOREIGN KEY ("connectedAddress") REFERENCES "ConnectedAddress"("address") ON DELETE SET NULL ON UPDATE CASCADE;

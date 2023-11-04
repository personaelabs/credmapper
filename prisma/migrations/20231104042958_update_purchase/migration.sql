-- AlterTable
ALTER TABLE "PurchasedEvent" ADD COLUMN     "connectedAddress" TEXT;

-- AddForeignKey
ALTER TABLE "PurchasedEvent" ADD CONSTRAINT "PurchasedEvent_connectedAddress_fkey" FOREIGN KEY ("connectedAddress") REFERENCES "ConnectedAddress"("address") ON DELETE SET NULL ON UPDATE CASCADE;

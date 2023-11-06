-- CreateIndex
CREATE INDEX "PurchasedEvent_minter_idx" ON "PurchasedEvent"("minter");

-- CreateIndex
CREATE INDEX "TransferEvent_to_idx" ON "TransferEvent"("to");

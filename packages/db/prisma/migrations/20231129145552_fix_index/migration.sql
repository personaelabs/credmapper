-- DropIndex
DROP INDEX "ERC20TransferEvent_to_from_contractAddress_blockNumber_idx";

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_to_idx" ON "ERC20TransferEvent"("to");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_from_idx" ON "ERC20TransferEvent"("from");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_contractAddress_idx" ON "ERC20TransferEvent"("contractAddress");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_blockNumber_idx" ON "ERC20TransferEvent"("blockNumber");

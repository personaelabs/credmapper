-- DropIndex
DROP INDEX "ERC20TransferEvent_to_from_idx";

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_to_from_contractAddress_idx" ON "ERC20TransferEvent"("to", "from", "contractAddress");

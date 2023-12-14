-- RenameIndex
ALTER INDEX "ERC20TransferEvent2_blockNumber_idx" RENAME TO "ERC20TransferEvent_blockNumber_idx";

-- RenameIndex
ALTER INDEX "ERC20TransferEvent2_blockNumber_transactionIndex_key" RENAME TO "ERC20TransferEvent_blockNumber_transactionIndex_key";

-- RenameIndex
ALTER INDEX "ERC20TransferEvent2_contractId_idx" RENAME TO "ERC20TransferEvent_contractId_idx";

-- RenameIndex
ALTER INDEX "ERC20TransferEvent2_from_idx" RENAME TO "ERC20TransferEvent_from_idx";

-- RenameIndex
ALTER INDEX "ERC20TransferEvent2_to_idx" RENAME TO "ERC20TransferEvent_to_idx";

-- CreateTable
CREATE TABLE "ERC20TransferEvent" (
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "contractId" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_to_idx" ON "ERC20TransferEvent"("to");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_from_idx" ON "ERC20TransferEvent"("from");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_contractId_idx" ON "ERC20TransferEvent"("contractId");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_blockNumber_idx" ON "ERC20TransferEvent"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ERC20TransferEvent_blockNumber_transactionIndex_key" ON "ERC20TransferEvent"("blockNumber", "transactionIndex");

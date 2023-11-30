-- CreateTable
CREATE TABLE "ERC20TransferEvent2" (
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" SMALLINT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "contractId" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ERC20TransferEvent2_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateIndex
CREATE INDEX "ERC20TransferEvent2_to_idx" ON "ERC20TransferEvent2"("to");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent2_from_idx" ON "ERC20TransferEvent2"("from");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent2_contractId_idx" ON "ERC20TransferEvent2"("contractId");

-- CreateIndex
CREATE INDEX "ERC20TransferEvent2_blockNumber_idx" ON "ERC20TransferEvent2"("blockNumber");

-- CreateTable
CREATE TABLE "ERC20TransferEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ERC20TransferEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateIndex
CREATE INDEX "ERC20TransferEvent_to_from_idx" ON "ERC20TransferEvent"("to", "from");

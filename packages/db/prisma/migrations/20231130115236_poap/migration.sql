-- CreateTable
CREATE TABLE "PoapTransferEvent" (
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" SMALLINT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PoapEventTokenEvent" (
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" SMALLINT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "tokenId" BIGINT NOT NULL,
    "eventId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PoapTransferEvent_tokenId_idx" ON "PoapTransferEvent"("tokenId");

-- CreateIndex
CREATE INDEX "PoapTransferEvent_from_idx" ON "PoapTransferEvent"("from");

-- CreateIndex
CREATE INDEX "PoapTransferEvent_blockNumber_idx" ON "PoapTransferEvent"("blockNumber");

-- CreateIndex
CREATE INDEX "PoapTransferEvent_to_idx" ON "PoapTransferEvent"("to");

-- CreateIndex
CREATE UNIQUE INDEX "PoapTransferEvent_transactionHash_logIndex_key" ON "PoapTransferEvent"("transactionHash", "logIndex");

-- CreateIndex
CREATE INDEX "PoapEventTokenEvent_tokenId_idx" ON "PoapEventTokenEvent"("tokenId");

-- CreateIndex
CREATE INDEX "PoapEventTokenEvent_eventId_idx" ON "PoapEventTokenEvent"("eventId");

-- CreateIndex
CREATE INDEX "PoapEventTokenEvent_to_idx" ON "PoapEventTokenEvent"("to");

-- CreateIndex
CREATE INDEX "PoapEventTokenEvent_from_idx" ON "PoapEventTokenEvent"("from");

-- CreateIndex
CREATE INDEX "PoapEventTokenEvent_blockNumber_idx" ON "PoapEventTokenEvent"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PoapEventTokenEvent_transactionHash_logIndex_key" ON "PoapEventTokenEvent"("transactionHash", "logIndex");

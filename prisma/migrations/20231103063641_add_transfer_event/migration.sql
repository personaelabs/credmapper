-- CreateTable
CREATE TABLE "TransferEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chain" "Chain" NOT NULL DEFAULT 'Zora',

    CONSTRAINT "TransferEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- AddForeignKey
ALTER TABLE "TransferEvent" ADD CONSTRAINT "TransferEvent_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES "CreateDropEvent"("editionContractAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

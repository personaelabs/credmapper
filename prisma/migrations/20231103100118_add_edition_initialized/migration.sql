-- CreateTable
CREATE TABLE "EditionInitializedEvent" (
    "transactionHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageURI" TEXT NOT NULL,
    "animationURI" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chain" "Chain" NOT NULL DEFAULT 'Zora',

    CONSTRAINT "EditionInitializedEvent_pkey" PRIMARY KEY ("transactionHash")
);

-- AddForeignKey
ALTER TABLE "EditionInitializedEvent" ADD CONSTRAINT "EditionInitializedEvent_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES "CreateDropEvent"("editionContractAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

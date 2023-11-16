-- CreateTable
CREATE TABLE "TokenBalance" (
    "address" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "balance" BIGINT NOT NULL,
    "chain" "Chain" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenBalance_pkey" PRIMARY KEY ("address","contractAddress")
);

-- CreateTable
CREATE TABLE "TxCount" (
    "address" TEXT NOT NULL,
    "txCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TxCount_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Whale" (
    "contractId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "durationStart" TIMESTAMP(3) NOT NULL,
    "durationEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Whale_pkey" PRIMARY KEY ("contractId","address","durationStart","durationEnd")
);

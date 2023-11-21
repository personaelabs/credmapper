-- CreateEnum
CREATE TYPE "Cred" AS ENUM ('Over100Txs');

-- CreateTable
CREATE TABLE "PackagedCred" (
    "id" TEXT NOT NULL,
    "cred" "Cred" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagedCred_pkey" PRIMARY KEY ("id")
);

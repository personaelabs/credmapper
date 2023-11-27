/*
  Warnings:

  - You are about to drop the `ContractDeployment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ContractDeployment";

-- CreateTable
CREATE TABLE "AddressInfo" (
    "address" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "firstTx" TEXT NOT NULL,
    "firstTxTimestamp" TIMESTAMP(3) NOT NULL,
    "txCount" INTEGER NOT NULL,
    "contractDeployments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddressInfo_pkey" PRIMARY KEY ("address")
);

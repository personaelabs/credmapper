/*
  Warnings:

  - You are about to drop the `AddressInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AddressInfo";

-- CreateTable
CREATE TABLE "Address" (
    "address" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "firstTx" TEXT NOT NULL,
    "firstTxTimestamp" TIMESTAMP(3) NOT NULL,
    "txCount" INTEGER NOT NULL,
    "contractDeployments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userFid" BIGINT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("address","network")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userFid_fkey" FOREIGN KEY ("userFid") REFERENCES "User"("fid") ON DELETE SET NULL ON UPDATE CASCADE;

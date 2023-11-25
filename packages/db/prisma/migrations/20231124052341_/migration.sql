/*
  Warnings:

  - The primary key for the `TxCount` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "TxCount" DROP CONSTRAINT "TxCount_pkey",
ADD CONSTRAINT "TxCount_pkey" PRIMARY KEY ("address", "network");

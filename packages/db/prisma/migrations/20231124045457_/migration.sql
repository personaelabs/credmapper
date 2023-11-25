/*
  Warnings:

  - Added the required column `network` to the `TxCount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Chain" ADD VALUE 'Base';

-- AlterTable
ALTER TABLE "TxCount" ADD COLUMN     "network" TEXT NOT NULL;

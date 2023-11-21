/*
  Warnings:

  - Added the required column `venue` to the `TxCount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Venue" AS ENUM ('Farcaster', 'Lens');

-- AlterTable
ALTER TABLE "TxCount" ADD COLUMN     "venue" "Venue" NOT NULL;

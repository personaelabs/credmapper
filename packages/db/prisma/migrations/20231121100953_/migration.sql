/*
  Warnings:

  - You are about to drop the column `canceld` on the `TGChat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TGChat" DROP COLUMN "canceld",
ADD COLUMN     "canceled" BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - You are about to drop the column `parentHash` on the `PackagedCast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PackagedCast" DROP COLUMN "parentHash",
ADD COLUMN     "parentUrl" TEXT;

/*
  Warnings:

  - You are about to drop the column `mentionPositions` on the `PackagedCast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PackagedCast" DROP COLUMN "mentionPositions",
ADD COLUMN     "mentionsPositions" INTEGER[];

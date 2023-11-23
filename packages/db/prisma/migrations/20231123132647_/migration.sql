/*
  Warnings:

  - You are about to drop the column `images` on the `PackagedCast` table. All the data in the column will be lost.
  - You are about to drop the column `ogpImage` on the `PackagedCast` table. All the data in the column will be lost.
  - You are about to drop the column `parentUrl` on the `PackagedCast` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `PackagedCast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PackagedCast" DROP COLUMN "images",
DROP COLUMN "ogpImage",
DROP COLUMN "parentUrl",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "embeds" TEXT[],
ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mentionPositions" INTEGER[],
ADD COLUMN     "mentions" BIGINT[],
ADD COLUMN     "parentHash" TEXT,
ADD COLUMN     "recastsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repliesCount" INTEGER NOT NULL DEFAULT 0;

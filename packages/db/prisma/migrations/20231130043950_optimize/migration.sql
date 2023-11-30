/*
  Warnings:

  - You are about to alter the column `score` on the `PackagedCast` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "PackagedCast" ALTER COLUMN "score" SET DEFAULT 0,
ALTER COLUMN "score" SET DATA TYPE BIGINT;

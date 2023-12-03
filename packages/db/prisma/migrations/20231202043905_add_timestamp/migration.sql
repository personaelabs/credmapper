/*
  Warnings:

  - Added the required column `timestamp` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

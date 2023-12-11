/*
  Warnings:

  - Added the required column `ensAddress` to the `TwitterUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TwitterUser" ADD COLUMN     "ensAddress" TEXT NOT NULL;

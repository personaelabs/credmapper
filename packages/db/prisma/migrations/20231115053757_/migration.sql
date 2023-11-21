/*
  Warnings:

  - Added the required column `originalContentDigest` to the `MirrorPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MirrorPost" ADD COLUMN     "originalContentDigest" TEXT NOT NULL;

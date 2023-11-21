/*
  Warnings:

  - Added the required column `venue` to the `PackagedCred` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PackagedCred" ADD COLUMN     "venue" "Venue" NOT NULL;

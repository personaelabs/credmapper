/*
  Warnings:

  - The `images` column on the `PackagedCast` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `ogpImage` on the `PackagedCast` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PackagedCast" DROP COLUMN "images",
ADD COLUMN     "images" BYTEA[],
DROP COLUMN "ogpImage",
ADD COLUMN     "ogpImage" BYTEA NOT NULL;

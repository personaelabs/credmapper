/*
  Warnings:

  - Changed the type of `cred` on the `PackagedCast` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PackagedCast" DROP COLUMN "cred",
ADD COLUMN     "cred" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Cred";

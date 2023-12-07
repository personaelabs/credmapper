/*
  Warnings:

  - You are about to drop the column `contractDeployments` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `txCount` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the `Whale` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `UserCred` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "contractDeployments",
DROP COLUMN "txCount";

-- AlterTable
ALTER TABLE "UserCred" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Whale";

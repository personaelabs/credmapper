/*
  Warnings:

  - You are about to drop the column `cred` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ConnectedAddress` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConnectedAddress" DROP CONSTRAINT "ConnectedAddress_fid_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cred",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "ConnectedAddress";

-- CreateTable
CREATE TABLE "UserCred" (
    "cred" TEXT NOT NULL,
    "address" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fid" INTEGER NOT NULL,

    CONSTRAINT "UserCred_pkey" PRIMARY KEY ("fid","cred")
);

-- AddForeignKey
ALTER TABLE "UserCred" ADD CONSTRAINT "UserCred_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;

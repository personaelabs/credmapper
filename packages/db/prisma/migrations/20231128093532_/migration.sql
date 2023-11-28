/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserCred` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "PackagedCast" DROP CONSTRAINT "PackagedCast_fid_fkey";

-- DropForeignKey
ALTER TABLE "UserCred" DROP CONSTRAINT "UserCred_fid_fkey";

-- AlterTable
ALTER TABLE "PackagedCast" ALTER COLUMN "fid" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "fid" SET DATA TYPE BIGINT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("fid");

-- AlterTable
ALTER TABLE "UserCred" DROP CONSTRAINT "UserCred_pkey",
ALTER COLUMN "fid" SET DATA TYPE BIGINT,
ADD CONSTRAINT "UserCred_pkey" PRIMARY KEY ("fid", "cred");

-- AddForeignKey
ALTER TABLE "PackagedCast" ADD CONSTRAINT "PackagedCast_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCred" ADD CONSTRAINT "UserCred_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;

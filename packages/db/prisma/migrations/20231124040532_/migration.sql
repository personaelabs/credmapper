/*
  Warnings:

  - You are about to drop the `UserCred` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCred" DROP CONSTRAINT "UserCred_fid_fkey";

-- DropTable
DROP TABLE "UserCred";

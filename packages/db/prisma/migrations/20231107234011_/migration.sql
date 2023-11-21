/*
  Warnings:

  - You are about to drop the column `userFid` on the `ConnectedAddress` table. All the data in the column will be lost.
  - You are about to drop the `HubEventsSyncInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LinkInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fid` to the `ConnectedAddress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConnectedAddress" DROP CONSTRAINT "ConnectedAddress_userFid_fkey";

-- AlterTable
ALTER TABLE "ConnectedAddress" DROP COLUMN "userFid",
ADD COLUMN     "fid" INTEGER NOT NULL;

-- DropTable
DROP TABLE "HubEventsSyncInfo";

-- DropTable
DROP TABLE "LinkInfo";

-- AddForeignKey
ALTER TABLE "ConnectedAddress" ADD CONSTRAINT "ConnectedAddress_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `address` on the `PackagedCast` table. All the data in the column will be lost.
  - You are about to drop the column `cred` on the `PackagedCast` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `PackagedCast` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `PackagedCast` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `PackagedCast` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `TxCount` table. All the data in the column will be lost.
  - You are about to drop the `ERC1155Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ERC721Metadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ERC721Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LensUserAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MirrorPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackagedCastSent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchasedEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SyncInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TGChat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenBalance` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fid` to the `PackagedCast` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PackagedCastSent" DROP CONSTRAINT "PackagedCastSent_chatId_fkey";

-- DropForeignKey
ALTER TABLE "PackagedCastSent" DROP CONSTRAINT "PackagedCastSent_packagedCastId_fkey";

-- AlterTable
ALTER TABLE "PackagedCast" DROP COLUMN "address",
DROP COLUMN "cred",
DROP COLUMN "displayName",
DROP COLUMN "username",
DROP COLUMN "venue",
ADD COLUMN     "fid" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TxCount" DROP COLUMN "venue";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cred" TEXT[];

-- DropTable
DROP TABLE "ERC1155Token";

-- DropTable
DROP TABLE "ERC721Metadata";

-- DropTable
DROP TABLE "ERC721Token";

-- DropTable
DROP TABLE "LensUserAddress";

-- DropTable
DROP TABLE "MessageLog";

-- DropTable
DROP TABLE "MirrorPost";

-- DropTable
DROP TABLE "PackagedCastSent";

-- DropTable
DROP TABLE "PurchasedEvent";

-- DropTable
DROP TABLE "SyncInfo";

-- DropTable
DROP TABLE "TGChat";

-- DropTable
DROP TABLE "TokenBalance";

-- DropEnum
DROP TYPE "Venue";

-- AddForeignKey
ALTER TABLE "PackagedCast" ADD CONSTRAINT "PackagedCast_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;

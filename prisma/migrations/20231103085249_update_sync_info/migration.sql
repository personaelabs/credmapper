/*
  Warnings:

  - The primary key for the `SyncInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SyncInfo` table. All the data in the column will be lost.
  - Added the required column `eventName` to the `SyncInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SyncInfo" DROP CONSTRAINT "SyncInfo_pkey",
DROP COLUMN "id",
ADD COLUMN     "eventName" TEXT NOT NULL,
ADD CONSTRAINT "SyncInfo_pkey" PRIMARY KEY ("eventName", "chain");

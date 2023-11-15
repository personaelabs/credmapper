/*
  Warnings:

  - You are about to drop the column `name` on the `MirrorPost` table. All the data in the column will be lost.
  - Added the required column `body` to the `MirrorPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `MirrorPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `MirrorPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MirrorPost" DROP COLUMN "name",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

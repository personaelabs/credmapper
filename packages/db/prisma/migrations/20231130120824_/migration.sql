/*
  Warnings:

  - You are about to drop the column `from` on the `PoapEventTokenEvent` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `PoapEventTokenEvent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PoapEventTokenEvent_from_idx";

-- DropIndex
DROP INDEX "PoapEventTokenEvent_to_idx";

-- AlterTable
ALTER TABLE "PoapEventTokenEvent" DROP COLUMN "from",
DROP COLUMN "to";

/*
  Warnings:

  - The primary key for the `Reaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Reaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fid,castId,reactionType]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reactionType` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_pkey",
DROP COLUMN "id",
DROP COLUMN "type",
ADD COLUMN     "reactionType" SMALLINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_fid_castId_reactionType_key" ON "Reaction"("fid", "castId", "reactionType");

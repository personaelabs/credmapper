/*
  Warnings:

  - You are about to drop the column `areweaveTx` on the `MirrorPost` table. All the data in the column will be lost.
  - Added the required column `arweaveTx` to the `MirrorPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chain` to the `MirrorPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MirrorPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MirrorPost" DROP COLUMN "areweaveTx",
ADD COLUMN     "arweaveTx" TEXT NOT NULL,
ADD COLUMN     "chain" "Chain" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

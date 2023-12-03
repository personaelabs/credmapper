-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_castId_fkey";

-- AlterTable
ALTER TABLE "PackagedCast" ADD COLUMN     "parentHash" TEXT,
ADD COLUMN     "rootParentHash" TEXT;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_castId_fkey" FOREIGN KEY ("castId") REFERENCES "PackagedCast"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

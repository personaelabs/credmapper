-- AlterTable
ALTER TABLE "TGChat" ADD COLUMN     "channels" TEXT[] DEFAULT ARRAY[]::TEXT[];

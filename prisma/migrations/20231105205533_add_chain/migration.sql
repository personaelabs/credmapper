/*
  Warnings:

  - Added the required column `chain` to the `ERC1155Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ERC1155Token" ADD COLUMN     "chain" "Chain" NOT NULL;

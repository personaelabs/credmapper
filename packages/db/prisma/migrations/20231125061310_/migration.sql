/*
  Warnings:

  - You are about to drop the column `address` on the `ContractDeployment` table. All the data in the column will be lost.
  - Added the required column `contractAddress` to the `ContractDeployment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from` to the `ContractDeployment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContractDeployment" DROP COLUMN "address",
ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "from" TEXT NOT NULL;

/*
  Warnings:

  - The primary key for the `AddressInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "AddressInfo" DROP CONSTRAINT "AddressInfo_pkey",
ADD CONSTRAINT "AddressInfo_pkey" PRIMARY KEY ("address", "network");

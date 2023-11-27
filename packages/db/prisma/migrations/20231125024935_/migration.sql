/*
  Warnings:

  - Added the required column `value` to the `BeaconDepositEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BeaconDepositEvent" ADD COLUMN     "value" BIGINT NOT NULL;

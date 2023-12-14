/*
  Warnings:

  - Added the required column `castId` to the `NotificationTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationTicket" ADD COLUMN     "castId" TEXT NOT NULL;

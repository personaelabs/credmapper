/*
  Warnings:

  - You are about to drop the `HubEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "HubEvent";

-- CreateTable
CREATE TABLE "HubEvnetsSyncInfo" (
    "eventType" TEXT NOT NULL,
    "synchedEventId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubEvnetsSyncInfo_pkey" PRIMARY KEY ("eventType")
);

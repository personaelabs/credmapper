/*
  Warnings:

  - You are about to drop the `HubEvnetsSyncInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "HubEvnetsSyncInfo";

-- CreateTable
CREATE TABLE "HubEventsSyncInfo" (
    "eventType" TEXT NOT NULL,
    "synchedEventId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubEventsSyncInfo_pkey" PRIMARY KEY ("eventType")
);

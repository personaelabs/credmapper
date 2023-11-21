/*
  Warnings:

  - You are about to drop the `PackagedCred` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackagedCredSent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PackagedCredSent" DROP CONSTRAINT "PackagedCredSent_chatId_fkey";

-- DropForeignKey
ALTER TABLE "PackagedCredSent" DROP CONSTRAINT "PackagedCredSent_packagedCredId_fkey";

-- DropTable
DROP TABLE "PackagedCred";

-- DropTable
DROP TABLE "PackagedCredSent";

-- CreateTable
CREATE TABLE "PackagedCast" (
    "id" TEXT NOT NULL,
    "cred" "Cred" NOT NULL,
    "venue" "Venue" NOT NULL,
    "address" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "ogpImage" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "parentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagedCast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagedCastSent" (
    "packagedCastId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PackagedCastSent_packagedCastId_chatId_key" ON "PackagedCastSent"("packagedCastId", "chatId");

-- AddForeignKey
ALTER TABLE "PackagedCastSent" ADD CONSTRAINT "PackagedCastSent_packagedCastId_fkey" FOREIGN KEY ("packagedCastId") REFERENCES "PackagedCast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagedCastSent" ADD CONSTRAINT "PackagedCastSent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TGChat"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;

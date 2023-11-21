-- CreateTable
CREATE TABLE "PackagedCredSent" (
    "packagedCredId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PackagedCredSent_packagedCredId_chatId_key" ON "PackagedCredSent"("packagedCredId", "chatId");

-- AddForeignKey
ALTER TABLE "PackagedCredSent" ADD CONSTRAINT "PackagedCredSent_packagedCredId_fkey" FOREIGN KEY ("packagedCredId") REFERENCES "PackagedCred"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagedCredSent" ADD CONSTRAINT "PackagedCredSent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TGChat"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;

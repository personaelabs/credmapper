-- CreateTable
CREATE TABLE "NotificationTicket" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSent" (
    "castId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSent_castId_token_key" ON "NotificationSent"("castId", "token");

-- CreateTable
CREATE TABLE "LinkInfo" (
    "id" SERIAL NOT NULL,
    "latestLinkTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkInfo_pkey" PRIMARY KEY ("id")
);

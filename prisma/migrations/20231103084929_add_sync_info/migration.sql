-- CreateTable
CREATE TABLE "SyncInfo" (
    "id" SERIAL NOT NULL,
    "synchedBlock" BIGINT NOT NULL,
    "chain" "Chain" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncInfo_pkey" PRIMARY KEY ("id")
);

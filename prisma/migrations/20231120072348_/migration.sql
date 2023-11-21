-- CreateTable
CREATE TABLE "LensUserAddress" (
    "profileId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LensUserAddress_pkey" PRIMARY KEY ("profileId")
);

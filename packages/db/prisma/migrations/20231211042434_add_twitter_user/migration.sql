-- CreateTable
CREATE TABLE "TwitterUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ens" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "followers" BIGINT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "ranking" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitterUser_pkey" PRIMARY KEY ("id")
);

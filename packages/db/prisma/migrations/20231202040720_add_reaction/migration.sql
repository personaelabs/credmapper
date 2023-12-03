-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "fid" BIGINT NOT NULL,
    "type" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "castId" TEXT NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_castId_fkey" FOREIGN KEY ("castId") REFERENCES "PackagedCast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

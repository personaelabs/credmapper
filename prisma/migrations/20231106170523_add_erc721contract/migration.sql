-- CreateTable
CREATE TABLE "ERC721Contract" (
    "contractAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ERC721Contract_pkey" PRIMARY KEY ("contractAddress")
);

-- CreateTable
CREATE TABLE "MembershipProof" (
    "proofHash" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "proofVersion" TEXT NOT NULL DEFAULT 'v1',
    "publicInput" TEXT NOT NULL,
    "merkleRoot" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipProof_pkey" PRIMARY KEY ("proofHash")
);

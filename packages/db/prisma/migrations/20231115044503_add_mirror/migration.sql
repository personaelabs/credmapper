-- CreateTable
CREATE TABLE "MirrorPost" (
    "digest" TEXT NOT NULL,
    "areweaveTx" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descritpion" TEXT NOT NULL,
    "imageURI" TEXT NOT NULL,
    "proxyAddress" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "MirrorPost_pkey" PRIMARY KEY ("digest")
);

-- CreateIndex
CREATE INDEX "MirrorPost_owner_idx" ON "MirrorPost"("owner");

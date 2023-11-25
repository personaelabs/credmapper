-- CreateTable
CREATE TABLE "UserCred" (
    "cred" TEXT NOT NULL,
    "fid" INTEGER NOT NULL,

    CONSTRAINT "UserCred_pkey" PRIMARY KEY ("fid","cred")
);

-- AddForeignKey
ALTER TABLE "UserCred" ADD CONSTRAINT "UserCred_fid_fkey" FOREIGN KEY ("fid") REFERENCES "User"("fid") ON DELETE RESTRICT ON UPDATE CASCADE;

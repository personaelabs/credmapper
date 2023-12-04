-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "firstTx" DROP NOT NULL,
ALTER COLUMN "firstTxTimestamp" DROP NOT NULL;

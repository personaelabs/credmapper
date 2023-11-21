-- AlterTable
ALTER TABLE "ERC1155Token" ADD COLUMN     "connectedAddress" TEXT;

-- AddForeignKey
ALTER TABLE "ERC1155Token" ADD CONSTRAINT "ERC1155Token_connectedAddress_fkey" FOREIGN KEY ("connectedAddress") REFERENCES "ConnectedAddress"("address") ON DELETE SET NULL ON UPDATE CASCADE;

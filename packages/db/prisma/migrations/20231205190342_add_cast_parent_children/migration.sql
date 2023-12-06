-- AddForeignKey
ALTER TABLE "PackagedCast" ADD CONSTRAINT "PackagedCast_parentHash_fkey" FOREIGN KEY ("parentHash") REFERENCES "PackagedCast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

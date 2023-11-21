-- AlterTable
ALTER TABLE "TGChat" ADD COLUMN     "dailyUpdatesEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "venues" "Venue"[] DEFAULT ARRAY['Farcaster', 'Lens']::"Venue"[];

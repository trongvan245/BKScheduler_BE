-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "notifiedStarted" BOOLEAN DEFAULT false,
ADD COLUMN     "notifiedUpcoming" BOOLEAN DEFAULT false;

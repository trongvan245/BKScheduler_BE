/*
  Warnings:

  - The `type` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EVENT_TYPE" AS ENUM ('EVENT', 'FOCUS_TIME', 'OUT_OF_OFFICE', 'WORKING_LOCATION', 'TASK', 'APPOINTMENT_SCHEDULE', 'MEETING');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "type",
ADD COLUMN     "type" "EVENT_TYPE" NOT NULL DEFAULT 'EVENT';

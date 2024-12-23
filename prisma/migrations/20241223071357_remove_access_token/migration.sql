/*
  Warnings:

  - You are about to drop the column `access_token` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "access_token";

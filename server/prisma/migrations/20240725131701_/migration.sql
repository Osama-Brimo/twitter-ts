/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "deletedAt",
ALTER COLUMN "squashedCount" SET DEFAULT 0;

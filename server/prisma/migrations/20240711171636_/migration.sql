/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Retweet` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Retweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Retweet" DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt";

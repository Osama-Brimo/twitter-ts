/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Like` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Like" DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt";

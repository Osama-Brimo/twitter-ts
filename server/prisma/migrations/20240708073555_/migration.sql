/*
  Warnings:

  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Like` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Like_tweetId_userId_key";

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("tweetId", "userId");

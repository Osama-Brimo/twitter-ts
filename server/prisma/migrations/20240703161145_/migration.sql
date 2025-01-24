/*
  Warnings:

  - You are about to drop the column `retweetId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Tweet` table. All the data in the column will be lost.
  - Made the column `tweetId` on table `Retweet` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `content` to the `Tweet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Retweet" DROP CONSTRAINT "Retweet_tweetId_fkey";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "retweetId";

-- AlterTable
ALTER TABLE "Retweet" ALTER COLUMN "tweetId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "message",
ADD COLUMN     "content" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatarUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Retweet" ADD CONSTRAINT "Retweet_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

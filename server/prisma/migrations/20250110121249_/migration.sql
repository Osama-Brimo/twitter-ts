/*
  Warnings:

  - You are about to drop the column `kind` on the `Hashtag` table. All the data in the column will be lost.
  - You are about to drop the column `tweetCount` on the `Hashtag` table. All the data in the column will be lost.
  - You are about to drop the column `tweetId` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopicQuote` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[hashtag]` on the table `Hashtag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postId` to the `Interaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Event" ADD VALUE 'RETWEET_LIKE';

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_tweetId_fkey";

-- DropForeignKey
ALTER TABLE "TopicQuote" DROP CONSTRAINT "TopicQuote_topicId_fkey";

-- AlterTable
ALTER TABLE "Hashtag" DROP COLUMN "kind",
DROP COLUMN "tweetCount";

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "tweetId",
ADD COLUMN     "postId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Topic";

-- DropTable
DROP TABLE "TopicQuote";

-- DropEnum
DROP TYPE "Trend";

-- CreateTable
CREATE TABLE "_HashtagToTweet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_HashtagToTweet_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HashtagToTweet_B_index" ON "_HashtagToTweet"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_hashtag_key" ON "Hashtag"("hashtag");

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HashtagToTweet" ADD CONSTRAINT "_HashtagToTweet_A_fkey" FOREIGN KEY ("A") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HashtagToTweet" ADD CONSTRAINT "_HashtagToTweet_B_fkey" FOREIGN KEY ("B") REFERENCES "Tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

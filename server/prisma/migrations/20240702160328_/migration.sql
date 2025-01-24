/*
  Warnings:

  - You are about to drop the column `kind` on the `Retweet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_retweetId_fkey";

-- AlterTable
ALTER TABLE "Retweet" DROP COLUMN "kind",
ADD COLUMN     "tweetId" TEXT;

-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "quoteId" TEXT;

-- AddForeignKey
ALTER TABLE "Retweet" ADD CONSTRAINT "Retweet_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Tweet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Retweet" DROP CONSTRAINT "Retweet_postId_fkey";

-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_postId_fkey";

-- AlterTable
ALTER TABLE "Retweet" ALTER COLUMN "postId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tweet" ALTER COLUMN "postId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Retweet" ADD CONSTRAINT "Retweet_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

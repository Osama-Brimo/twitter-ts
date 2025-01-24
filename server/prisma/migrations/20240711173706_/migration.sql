/*
  Warnings:

  - The primary key for the `Retweet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `retweeterId` on the `Retweet` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Retweet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Retweet" DROP CONSTRAINT "Retweet_retweeterId_fkey";

-- AlterTable
ALTER TABLE "Retweet" DROP CONSTRAINT "Retweet_pkey",
DROP COLUMN "retweeterId",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Retweet_pkey" PRIMARY KEY ("tweetId", "userId");

-- AddForeignKey
ALTER TABLE "Retweet" ADD CONSTRAINT "Retweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

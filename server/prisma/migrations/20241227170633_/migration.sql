/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `Retweet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId]` on the table `Tweet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postId` to the `Retweet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postId` to the `Tweet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TWEET', 'RETWEET');

-- AlterTable
ALTER TABLE "Retweet" ADD COLUMN     "postId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "postId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "authorid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Retweet_postId_key" ON "Retweet"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_postId_key" ON "Tweet"("postId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorid_fkey" FOREIGN KEY ("authorid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retweet" ADD CONSTRAINT "Retweet_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

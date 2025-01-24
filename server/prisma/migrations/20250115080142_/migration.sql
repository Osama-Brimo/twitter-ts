/*
  Warnings:

  - A unique constraint covering the columns `[metatweetId]` on the table `Tweet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `metatweetId` to the `Tweet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GalleryType" AS ENUM ('CAROUSEL', 'QUILT');

-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "metatweetId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TweetMetaInfo" (
    "tweetId" TEXT NOT NULL,
    "galleryType" "GalleryType" NOT NULL DEFAULT 'CAROUSEL',

    CONSTRAINT "TweetMetaInfo_pkey" PRIMARY KEY ("tweetId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_metatweetId_key" ON "Tweet"("metatweetId");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_metatweetId_fkey" FOREIGN KEY ("metatweetId") REFERENCES "TweetMetaInfo"("tweetId") ON DELETE RESTRICT ON UPDATE CASCADE;

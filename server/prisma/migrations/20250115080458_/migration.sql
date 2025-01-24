/*
  Warnings:

  - You are about to drop the column `metatweetId` on the `Tweet` table. All the data in the column will be lost.
  - The primary key for the `TweetMetaInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[metaId]` on the table `Tweet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tweetId]` on the table `TweetMetaInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `metaId` to the `Tweet` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TweetMetaInfo` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_metatweetId_fkey";

-- DropIndex
DROP INDEX "Tweet_metatweetId_key";

-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "metatweetId",
ADD COLUMN     "metaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TweetMetaInfo" DROP CONSTRAINT "TweetMetaInfo_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "tweetId" DROP NOT NULL,
ADD CONSTRAINT "TweetMetaInfo_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_metaId_key" ON "Tweet"("metaId");

-- CreateIndex
CREATE UNIQUE INDEX "TweetMetaInfo_tweetId_key" ON "TweetMetaInfo"("tweetId");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "TweetMetaInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

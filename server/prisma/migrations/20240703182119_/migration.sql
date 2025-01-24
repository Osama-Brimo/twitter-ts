/*
  Warnings:

  - The values [Hashtag,Topic] on the enum `Trend` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Suggestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Trend_new" AS ENUM ('HASHTAG', 'TOPIC');
ALTER TABLE "Suggestion" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "Hashtag" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "Topic" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TABLE "Suggestion" ALTER COLUMN "kind" TYPE "Trend_new" USING ("kind"::text::"Trend_new");
ALTER TABLE "Hashtag" ALTER COLUMN "kind" TYPE "Trend_new" USING ("kind"::text::"Trend_new");
ALTER TABLE "Topic" ALTER COLUMN "kind" TYPE "Trend_new" USING ("kind"::text::"Trend_new");
ALTER TYPE "Trend" RENAME TO "Trend_old";
ALTER TYPE "Trend_new" RENAME TO "Trend";
DROP TYPE "Trend_old";
ALTER TABLE "Hashtag" ALTER COLUMN "kind" SET DEFAULT 'HASHTAG';
ALTER TABLE "Topic" ALTER COLUMN "kind" SET DEFAULT 'TOPIC';
ALTER TABLE "Suggestion" ALTER COLUMN "kind" SET DEFAULT 'TOPIC';
COMMIT;

-- AlterTable
ALTER TABLE "Hashtag" ALTER COLUMN "kind" SET DEFAULT 'HASHTAG';

-- AlterTable
ALTER TABLE "Topic" ALTER COLUMN "kind" SET DEFAULT 'TOPIC';

-- DropTable
DROP TABLE "Suggestion";

-- DropEnum
DROP TYPE "RetweetKind";

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "tweetId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `userId` on the `Media` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[avatarUserId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_avatarId_fkey";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "userId",
ADD COLUMN     "avatarUserId" TEXT,
ADD COLUMN     "uploaderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Media_avatarUserId_key" ON "Media"("avatarUserId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_avatarUserId_fkey" FOREIGN KEY ("avatarUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `encoding` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Media` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `extension` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `size` on the `Media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "encoding",
DROP COLUMN "url",
ADD COLUMN     "extension" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Media_key_key" ON "Media"("key");

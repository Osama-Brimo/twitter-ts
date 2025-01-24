/*
  Warnings:

  - Added the required column `encoding` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "encoding" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL;

/*
  Warnings:

  - Added the required column `filename` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "size" BYTEA NOT NULL;

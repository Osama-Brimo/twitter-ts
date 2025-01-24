-- AlterTable
ALTER TABLE "User" ADD COLUMN     "vipParentId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vipParentId_fkey" FOREIGN KEY ("vipParentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

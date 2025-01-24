-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "squashedCount" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "_NotificationParticipant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_NotificationParticipant_AB_unique" ON "_NotificationParticipant"("A", "B");

-- CreateIndex
CREATE INDEX "_NotificationParticipant_B_index" ON "_NotificationParticipant"("B");

-- AddForeignKey
ALTER TABLE "_NotificationParticipant" ADD CONSTRAINT "_NotificationParticipant_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationParticipant" ADD CONSTRAINT "_NotificationParticipant_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

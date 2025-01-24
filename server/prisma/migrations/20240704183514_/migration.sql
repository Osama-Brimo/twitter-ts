-- CreateTable
CREATE TABLE "_BlockerBlocked" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BlockerBlocked_AB_unique" ON "_BlockerBlocked"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockerBlocked_B_index" ON "_BlockerBlocked"("B");

-- AddForeignKey
ALTER TABLE "_BlockerBlocked" ADD CONSTRAINT "_BlockerBlocked_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockerBlocked" ADD CONSTRAINT "_BlockerBlocked_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

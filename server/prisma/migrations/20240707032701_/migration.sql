-- CreateTable
CREATE TABLE "_FollowingFollowers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FollowingFollowers_AB_unique" ON "_FollowingFollowers"("A", "B");

-- CreateIndex
CREATE INDEX "_FollowingFollowers_B_index" ON "_FollowingFollowers"("B");

-- AddForeignKey
ALTER TABLE "_FollowingFollowers" ADD CONSTRAINT "_FollowingFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FollowingFollowers" ADD CONSTRAINT "_FollowingFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

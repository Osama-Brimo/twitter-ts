-- AlterTable
ALTER TABLE "_BlockerBlocked" ADD CONSTRAINT "_BlockerBlocked_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BlockerBlocked_AB_unique";

-- AlterTable
ALTER TABLE "_FollowingFollowers" ADD CONSTRAINT "_FollowingFollowers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FollowingFollowers_AB_unique";

-- AlterTable
ALTER TABLE "_NotificationParticipant" ADD CONSTRAINT "_NotificationParticipant_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_NotificationParticipant_AB_unique";

import { Link } from 'react-router-dom';
import { CalendarDays, LinkIcon, LockKeyholeIcon } from 'lucide-react';
import { User, type User as UserType } from '@/gql/graphql';
import { readableDate } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FollowButton from '@/components/tweet/buttons/follow/FollowButton';
import ProfileDropdownMenu from './ProfileDropdownMenu';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
  user: User;
  /**
   * The handle of the user from url params. Used when user does not exist, but we want to show a placeholder header.
   *
   * @type {string}
   * @memberof ProfileHeaderProps
   */
  paramHandle?: string;
}

// TODO: all the frontend work here for the profile header
const ProfileHeader = ({ user, paramHandle }: ProfileHeaderProps) => {
  const {
    _follower,
    createdAt,
    handle,
    name,
    website,
    isPrivate,
    followers,
    following,
    bio,
    avatar,
  } = user ?? {};

  if (user?.id)
    return (
      <div>
        {/* Banner */}
        <div className="h-52 w-full overflow-hidden rounded-t-md relative">
          <div className="absolute w-full flex justify-end px-3 pt-3">
            <ProfileDropdownMenu user={user} />
          </div>
          <img className="object-contain" src="/placeholder.svg" />
        </div>
        {/* Info */}
        <div className="-mt-10 border-blue-400 b-1 w-full px-5">
          <div>
            <Avatar className="h-20 w-20 flex border-2 border-primary">
              <AvatarImage src={avatar?.url} alt="Avatar" />
              <AvatarFallback className="text-3xl select-none">
                {name?.at(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-col">
            <div className="mt-2 flex w-ful justify-between">
              <div className="flex-col">
                <div className="font-bold text-lg flex">
                  <p>{name}</p>
                  {isPrivate && (
                    <Badge>
                      <LockKeyholeIcon size="16" />
                    </Badge>
                  )}
                  {_follower && <Badge variant="secondary">Follows you</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>@{handle}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <FollowButton targetUser={user} />
              </div>
            </div>
            <div className="mt-4">
              <p>{bio}</p>
              <div className="flex gap-3">
                {website && (
                  <a
                    target="_blank"
                    href={website}
                    className="flex items-center pt-2"
                  >
                    <LinkIcon className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-sm text-blue-400 underline">
                      {website}
                    </span>
                  </a>
                )}
                {createdAt && (
                  <div className="flex items-center pt-2">
                    <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-sm text-muted-foreground">
                      Joined on {readableDate(createdAt)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex py-3">
                <p className="text-sm font-semibold mr-2">
                  Following {following?.length ?? 0}
                </p>
                <p className="text-sm font-semibold">
                  Followers {followers?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  else
    return (
      <div>
        {/* Banner */}
        <div className="h-52 w-full overflow-hidden rounded-t-md relative">
          <img className="object-contain" src="/placeholder.svg" />
        </div>

        {/*  */}
        <div className="-mt-10 border-blue-400 b-1 w-full px-5">
          <div>
            <Avatar className="h-20 w-20 flex border-2 border-primary">
              <AvatarImage src={avatar?.url} alt="Avatar" />
              <AvatarFallback className="text-3xl select-none">
                ?
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-col">
            <div className="mt-2 flex w-ful justify-between">
              <div className="flex-col">
                <div className="text-sm text-muted-foreground">
                  <span>@{paramHandle}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p>User does not exist.</p>
              <div className="flex py-3">
                <p className="text-sm font-semibold mr-2">Following 0</p>
                <p className="text-sm font-semibold">Followers 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ProfileHeader;

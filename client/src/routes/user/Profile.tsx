import { useLazyQuery, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import ProfileHeader from '@/components/app/profile/ProfileHeader';
import {
  allUserPosts,
  allUserLikes,
  userByHandle,
  allUserFollowers,
  allUserFollowing,
} from '@/gql/queries/routes/user/Profile';
import Feed from '@/components/app/feed/Feed';
import { useParams } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { FeedDisplayItemTypes, ProfileFeedTypes } from '@/lib/types';
import ProfileNavTabs from '@/components/app/profile/ProfileNavTabs';
import { useLocation } from 'react-router-dom';
import { getFeedDisplayType, getViewTypeFromPath } from '@/lib/helpers';
import { useNavigate } from 'react-router';
import SkeletonContent from '@/components/app/SkeletonContent';
import { User } from '@/gql/graphql';

const Profile = () => {
  const { handle } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [getAllUserPosts, getAllUserPostsQueryResult] =
    useLazyQuery(allUserPosts);
  const [getAllUserLikes, getAllUserLikesQueryResult] =
    useLazyQuery(allUserLikes);
  const [getAllUserFollowers, getAllUserFollowersQueryResult] =
    useLazyQuery(allUserFollowers);
  const [getAllUserFollowing, getAllUserFollowingQueryResult] =
    useLazyQuery(allUserFollowing);

  const { data, loading: userLoading } = useQuery(userByHandle, {
    variables: { handle },
    onError: (err) => {
      console.error(err);
      toast(err.message);
    },
    onCompleted: (data) => {
      console.log('user info loaded:', data);
    },
    // notifyOnNetworkStatusChange: true,
  });

  const user: User = useMemo(() => {
    if (data && !userLoading) {
      return data.userByHandle;
    }
  }, [data, userLoading]);

  const [feedType, setFeedType] = useState<ProfileFeedTypes>('posts');
  const [query, setQuery] = useState(allUserPosts);
  const [queryResult, setQueryResult] = useState(getAllUserPostsQueryResult);
  const [queryResultItemType, setQueryResultItemType] =
    useState<FeedDisplayItemTypes>('post');
  const [queryName, setQueryName] = useState('allUserPosts');

  // Set the viewType (what navtab we're on like followers, likes, etc.) from the pathname
  const viewType = useMemo(() => getViewTypeFromPath(pathname), [pathname]);
  // Get what 'container' we need based on the type of feed (i.e followers needs a user card)
  const displayType = useMemo(() => getFeedDisplayType(feedType), [feedType]);

  const feedLabel = useMemo(() => {
    switch (viewType) {
      case 'followers':
        return `Followed by`;
      case 'following':
        return `${user?.name} Follows`;
      case 'likes':
        return `${user?.name}'s Likes`;
      case 'posts':
        return 'All Posts';
      default:
        return '';
    }
  }, [user, viewType]);

  // Each view button (posts, likes, followers, etc.) will execute a lazy query on click
  // force used for setting data when type is already selected but query hasn't run (i.e: upon visit)
  const queryHandlers = useMemo(() => {
    return {
      async handleViewPosts(force = false) {
        if (force || feedType !== 'posts') {
          await getAllUserPosts({
            variables: { handle, offset: 0, limit: 15 },
            onError: (err) => {
              console.error('view likes handler error...');
              console.error(err);
            },
            onCompleted: (data) => {
              console.log(
                'view posts handler completed the query with data',
                data,
              );
              setFeedType('posts');
              setQueryResultItemType('post');
              navigate(`/${handle}/posts`);
            },
            notifyOnNetworkStatusChange: true,
          });
        }
      },
      async handleViewLikes(force = false) {
        if (force || feedType !== 'likes') {
          await getAllUserLikes({
            variables: { handle, offset: 0, limit: 15 },
            onError: (err) => {
              console.error('view likes handler error...');
              console.error(err);
            },
            onCompleted: (data) => {
              console.log(
                'view likes handler completed the query with data',
                data,
              );
              setFeedType('likes');
              setQueryResultItemType('like');
              navigate(`/${handle}/likes`);
            },
            notifyOnNetworkStatusChange: true,
          });
        }
      },
      async handleViewFollowers(force = false) {
        if (force || feedType !== 'followers') {
          await getAllUserFollowers({
            variables: { handle, offset: 0, limit: 15 },
            onError: (err) => {
              console.error('view followers handler error...');
              console.error(err);
            },
            onCompleted: (data) => {
              console.log(
                'view followers handler completed the query with data',
                data,
              );
              setFeedType('followers');
              setQueryResultItemType('user');
              navigate(`/${handle}/followers`);
            },
            notifyOnNetworkStatusChange: true,
          });
        }
      },
      async handleViewFollowing(force = false) {
        if (force || feedType !== 'following') {
          await getAllUserFollowing({
            variables: { handle, offset: 0, limit: 15 },
            onError: (err) => {
              console.error('view following handler error...');
              console.error(err);
            },
            onCompleted: (data) => {
              console.log(
                'view following handler completed the query with data',
                data,
              );
              setFeedType('following');
              setQueryResultItemType('user');
              navigate(`/${handle}/following`);
            },
            notifyOnNetworkStatusChange: true,
          });
        }
      },
    };
  }, [
    getAllUserFollowers,
    getAllUserFollowing,
    getAllUserLikes,
    getAllUserPosts,
    handle,
    navigate,
    feedType,
  ]);

  useEffect(() => {
    switch (feedType) {
      case 'posts':
        setQuery(allUserPosts);
        setQueryName('allUserPosts');
        setQueryResult(getAllUserPostsQueryResult);
        break;
      case 'likes':
        setQuery(allUserLikes);
        setQueryName('allUserLikes');
        setQueryResult(getAllUserLikesQueryResult);
        break;
      case 'followers':
        setQuery(allUserFollowers);
        setQueryResult(getAllUserFollowersQueryResult);
        setQueryName('allUserFollowers');
        break;
      case 'following':
        setQuery(allUserFollowing);
        setQueryName('allUserFollowing');
        setQueryResult(getAllUserFollowingQueryResult);
        break;
      default:
        setQuery(allUserPosts);
        setQueryName('allUserPosts');
        setQueryResult(getAllUserPostsQueryResult);
        break;
    }
  }, [
    getAllUserFollowersQueryResult,
    getAllUserFollowingQueryResult,
    getAllUserLikesQueryResult,
    getAllUserPostsQueryResult,
    feedType,
  ]);

  // Execute lazy query when first mounting based on path (/:user/likes, /:user/posts, etc.)
  useEffect(() => {
    const {
      handleViewPosts,
      handleViewLikes,
      handleViewFollowers,
      handleViewFollowing,
    } = queryHandlers;
    switch (viewType) {
      case 'posts':
        handleViewPosts(true);
        break;
      case 'likes':
        handleViewLikes(true);
        break;
      case 'followers':
        handleViewFollowers(true);
        break;
      case 'following':
        handleViewFollowing(true);
        break;
      default:
        break;
    }
  }, []);

  if (user?.isPrivate) {
    return (
      <div className="flex flex-col w-full">
        {!userLoading ? (
          <ProfileHeader user={user} paramHandle={handle} />
        ) : (
          <SkeletonContent type="user" />
        )}
        <div className="mt-6">
          <div className="flex flex-col text-center">
            <b className="text-2xl">{user.name}'s account is private.</b>
            <span className="text-sm text-muted-foreground">
              Only accepted followers can see @{user.handle}'s tweets. You can
              send a request to follow them.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Feed
      itemType={queryResultItemType}
      displayType={displayType}
      queryResult={queryResult}
      queryName={queryName}
      query={query}
      fetchMoreVars={{ handle }}
      feedLabel={feedLabel}
    >
      {!userLoading ? (
        <ProfileHeader user={user} paramHandle={handle} />
      ) : (
        <SkeletonContent type="user" />
      )}

      {!userLoading && user?.id ? (
        <ProfileNavTabs
          queryHandlers={queryHandlers}
          value={feedType}
          id="profile-feed-navtabs"
        />
      ) : null}
    </Feed>
  );
};

export default Profile;

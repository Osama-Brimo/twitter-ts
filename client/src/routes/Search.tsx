import { useLazyQuery } from '@apollo/client';
import Feed from '../components/app/feed/Feed';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { searchPosts, searchUsers } from '../gql/queries/routes/Search.js';
import { useSearchParams } from 'react-router-dom';
import {
  FeedDisplayItemTypes,
  SearchFeedDisplayTypes,
  SearchFeedQueryHandlers,
} from '../lib/types';
import SkeletonContent from '../components/app/SkeletonContent';
import { Loader2 } from 'lucide-react';

enum SearchTypeEnum {
  Posts = 'posts',
  Users = 'users',
  PostsAndUsers = 'postsAndUsers',
  Hashtags = 'hashtag',
}

type SearchParams = {
  q?: string | null;
  handle?: string | null;
  hashtag?: string | null;
  searchType?: SearchTypeEnum;
};

// TODO: Make this also search for users matching query at the top?
const Search = () => {
  // Params
  const [searchParams] = useSearchParams();
  const params: SearchParams = useMemo(() => {
    const q = searchParams.get('q');
    const handle = searchParams.get('handle');
    const hashtag = searchParams.get('hashtag');

    const searchTypeFallback = SearchTypeEnum.PostsAndUsers;

    const searchTypeParam = (searchParams.get('searchType') ??
      searchTypeFallback) as SearchTypeEnum;
    const searchType = Object.values(SearchTypeEnum).includes(searchTypeParam)
      ? searchTypeParam
      : searchTypeFallback;

    return {
      q,
      handle,
      hashtag,
      searchType,
    };
  }, [searchParams]);

  // GraphQl
  const [getSearchPosts, getSearchPostsResult] = useLazyQuery(searchPosts);
  const [getSearchUsers, getSearchUsersResult] = useLazyQuery(searchUsers);

  // State
  const [queryA, setQueryA] = useState(searchUsers);
  const [queryNameA, setQueryNameA] = useState('searchUsersAndCount');
  const [queryResultA, setQueryResultA] = useState(getSearchUsersResult);

  const [queryB, setQueryB] = useState(searchPosts);
  const [queryNameB, setQueryNameB] = useState('searchPostsAndCount');
  const [queryResultB, setQueryResultB] = useState(getSearchPostsResult);

  const [displayTypeA, setDisplayTypeA] =
    useState<SearchFeedDisplayTypes>('user');
  const [itemTypeA, setItemTypeA] = useState<FeedDisplayItemTypes>('user');

  const [displayTypeB, setDisplayTypeB] =
    useState<SearchFeedDisplayTypes>('post');
  const [itemTypeB, setItemTypeB] = useState<FeedDisplayItemTypes>('post');

  const [fetchMoreVarsA, setFetchMoreVarsA] = useState<SearchParams>({});
  const [fetchMoreVarsB, setFetchMoreVarsB] = useState<SearchParams>({});

  // get some needed query results like loading/count
  const {
    data: postsData,
    loading: postsLoading,
    called: postsCalled,
  } = getSearchPostsResult;
  const {
    data: usersData,
    loading: usersLoading,
    called: usersCalled,
  } = getSearchUsersResult;

  // grab count and loading state
  const resultCount = useMemo(() => {
    const pCount = postsData?.searchPostsAndCount.count ?? 0;
    const uCount = usersData?.searchUsersAndCount.count ?? 0;
    return {
      post: pCount,
      user: uCount,
      total: pCount + uCount,
    };
  }, [postsData, usersData]);

  const anyQueryLoading = useMemo(
    () => (postsCalled && postsLoading) || (usersCalled && usersLoading),
    [postsCalled, postsLoading, usersCalled, usersLoading],
  );

  // Query Handlers
  const searchPostsHandler = useCallback(
    async (force = false) => {
      console.log(
        'the vars coming in to posts before running',
        fetchMoreVarsB,
        params,
      );
      await getSearchPosts({
        variables: { ...fetchMoreVarsB, offset: 0, limit: 15 },
        onError: (err) => {
          console.error(err);
        },
        onCompleted: (d) => {
          console.log(`Search query for posts ran:`, d);
          setQueryB(searchPosts);
          setQueryNameB('searchPostsAndCount');
          setQueryResultB(getSearchPostsResult);
          setDisplayTypeB('post');
          setItemTypeB('post');
        },
        notifyOnNetworkStatusChange: true,
      });
    },
    [fetchMoreVarsB, getSearchPosts, getSearchPostsResult, params],
  );

  const searchUsersHandler = useCallback(
    async (force = false) => {
      await getSearchUsers({
        variables: { ...fetchMoreVarsA, offset: 0, limit: 15 },
        onError: (err) => {
          console.error(err);
        },
        onCompleted: (d) => {
          console.log(`Search query for users ran:`, d);
          setQueryA(searchUsers);
          setQueryNameA('searchUsersAndCount');
          setQueryResultA(getSearchUsersResult);
          setDisplayTypeA('user');
          setItemTypeA('user');
        },
        notifyOnNetworkStatusChange: true,
      });
    },
    [fetchMoreVarsA, getSearchUsers, getSearchUsersResult],
  );

  const queryHandlers: SearchFeedQueryHandlers = useMemo(
    () => ({
      searchPostsHandler,
      searchUsersHandler,
    }),
    [searchPostsHandler, searchUsersHandler],
  );

  // Effects
  // Each feed needs to know how to fetch more data using our params/searchType
  useEffect(() => {
    const { q, handle, hashtag, searchType } = params;

    console.log('fetchmore switcher', params);

    switch (searchType) {
      case SearchTypeEnum.Posts:
        setFetchMoreVarsB({ q });
        break;
      case SearchTypeEnum.Users:
        setFetchMoreVarsA({ q, handle });
        return;
      case SearchTypeEnum.PostsAndUsers:
        setFetchMoreVarsA({ q, handle });
        setFetchMoreVarsB({ q });
        return;
      case SearchTypeEnum.Hashtags:
        setFetchMoreVarsA({ hashtag });
        return;
      default:
        setFetchMoreVarsB({ q });
        return;
    }
  }, [params]);

  // Run inital search using Query Handlers
  useEffect(() => {
    const { searchType } = params;
    const { searchPosts, searchUsers } = queryHandlers;

    console.log(
      `search initializer useEffect ran with searchtype: ${searchType}`,
      params,
    );

    switch (searchType) {
      case SearchTypeEnum.Posts:
        searchPosts();
        break;
      case SearchTypeEnum.Users:
        searchUsers();
        break;
      case SearchTypeEnum.PostsAndUsers:
        searchPosts();
        searchUsers();
        break;
      default:
        searchPosts();
        break;
    }
  }, [params, queryHandlers]);

  // Helper components
  const FeedResultsMessage = () => {
    return (
      !anyQueryLoading && (
        <div className="flex flex-col text-sm">
          <div>{resultCount.total} total results found.</div>
          <div>
            {params.searchType === SearchTypeEnum.PostsAndUsers && (
              <small className="text-muted-foreground">
                Your search matched <strong>{resultCount.post}</strong> posts
                and <strong>{resultCount.user}</strong> users.
              </small>
            )}
          </div>
        </div>
      )
    );
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );

  return !anyQueryLoading ? (
    <>
      <FeedResultsMessage />
      {/* // Feed A */}
      <Feed
        displayType={displayTypeA}
        itemType={itemTypeA}
        query={queryA}
        queryName={queryNameA}
        queryResult={queryResultA}
        fetchMoreVars={fetchMoreVarsA}
        queryIsSearch={true}
      ></Feed>
      {/* // Feed B */}
      <Feed
        displayType={displayTypeB}
        itemType={itemTypeB}
        query={queryB}
        queryName={queryNameB}
        queryResult={queryResultB}
        fetchMoreVars={fetchMoreVarsB}
        queryIsSearch={true}
      ></Feed>
    </>
  ) : (
    <>
      <LoadingSpinner />
      <SkeletonContent type="card" repeat={3} />
    </>
  );
};

export default Search;

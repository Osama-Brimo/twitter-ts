import { useLazyQuery } from '@apollo/client';
import Suggestions from './Suggestions';
import Trends from './Trends';
import { getUserSuggestions as getUserSuggestionsQuery } from '@/gql/queries/common/User';
import { getTrendingHashtags as getTrendingHashtagsQuery } from '@/gql/queries/common/Hashtag';
import { useEffect } from 'react';
import { useUser } from '@/context/UserProvider';

const Aside = () => {
  const { user: currentUser } = useUser();
  const [
    getSuggestions,
    { data: suggestionsData, loading: suggestionsLoading },
  ] = useLazyQuery(getUserSuggestionsQuery, {
    onCompleted(data) {
      console.log('[getUserSuggestions] completed:', data);
    },
    onError(err) {
      console.error('[getUserSuggestions] error:', err);
    },
  });
  const [getTrending, { data: trendingData, loading: trendingLoading }] =
    useLazyQuery(getTrendingHashtagsQuery, {
      onCompleted(data) {
        console.log('[getUserSuggestions] completed:', data);
      },
      onError(err) {
        console.error('[getUserSuggestions] error:', err);
      },
    });

  useEffect(() => {
    if (currentUser?.id) {
      console.log(`[Aside.tsx]: fetching suggestions...`);
      (async () => {
        await getSuggestions();
      })();
    }
    // Currently, we refetch suggestions anytime the user id changes.
    // This means we'll refetch whenever the user logs out/back in (even for the same user).
    // But not when the currentUser changes some non-id property.
    // TODO: later, we might want to fetch more selectively, for example only when we have x new interactions.
  }, [currentUser?.id, getSuggestions]);

  useEffect(() => {
    console.log(`[Aside.tsx]: fetching trends...`);
    (async () => {
      await getTrending();
    })();
  }, [getTrending]);

  return (
    <div className="md:flex md:flex-col gap-4 lg:gap-8 hidden">
      <div className="sticky top-20 grid gap-4">
        <Suggestions
          loading={suggestionsLoading}
          suggestions={suggestionsData?.getUserSuggestions || []}
        />
        <Trends
          loading={trendingLoading}
          trends={trendingData?.getTrendingHashtags || []}
        />
      </div>
    </div>
  );
};

export default Aside;

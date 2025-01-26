import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import Suggestions from './Suggestions';
import Trends from './Trends';
import { getUserSuggestions as getUserSuggestionsMutation } from '@/gql/queries/common/User';
import { useEffect } from 'react';
import { useUser } from '@/context/UserProvider';

const Aside = () => {
  const { user:currentUser } = useUser();
  const [getSuggestions, { data, loading }] = useLazyQuery(getUserSuggestionsMutation, {
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
      })()
    }
    // Currently, we refetch suggestions anytime the user id changes.
    // This means we'll refetch whenever the user logs out/back in (even for the same user).
    // But not when the currentUser changes some non-id property.
    // TODO: later, we might want to fetch more selectively, for example only when we have x new interactions.
  }, [currentUser?.id, getSuggestions]);


  return (
    <div className="md:flex md:flex-col gap-4 lg:gap-8 hidden">
      <div className="sticky top-20 grid gap-4">
        <Suggestions
          loading={loading}
          suggestions={data?.getUserSuggestions || []}
        />
        <Trends />
      </div>
    </div>
  );
};

export default Aside;

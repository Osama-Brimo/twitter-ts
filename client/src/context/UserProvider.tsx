import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { type User as UserType } from '../gql/graphql';
import { currentUser as currentUserQuery } from '../gql/queries/common/User.js';
import { ApolloQueryResult, OperationVariables, useMutation, useQuery } from '@apollo/client';
import { client } from '../lib/apollo';
import Cookies from 'universal-cookie';
import { toast } from 'sonner';
import { logoutUser } from '../gql/mutations/common/User.js';

type UserProviderProps = {
  children: React.ReactNode;
};

type UserProviderState = {
  user: UserType | null;
  loading: boolean;
  error?: Error | null;
  refetchUser: (variables?: Partial<OperationVariables> | undefined) => Promise<ApolloQueryResult<any>>;
  logout?: () => Promise<string | false>;
};

const initialState: UserProviderState = {
  user: null,
  loading: false,
  refetchUser: () => {},
};

const UserProviderContext = createContext<UserProviderState>(initialState);

export const UserProvider = ({ children }: UserProviderProps) => {
  const { data, loading, error, refetch } = useQuery(currentUserQuery, {
    fetchPolicy: 'network-only',
  });

  const currentUser: UserType = useMemo(() => data?.currentUser, [data]);

  useEffect(() => {
    console.log('current user', currentUser);
  }, [currentUser]);

  const [logoutMutation] = useMutation(logoutUser);

  const logout = useCallback(async () => {
    try {
      const cookies = new Cookies();
      const authCookie = cookies.get('jwt_authorization');

      if (authCookie) {
        await logoutMutation();
        // Attempt to clear the cookie on the client also when the user logs out
        cookies.remove('jwt_authorization');
        cookies.get('jwt');
        await client.resetStore();
        return '/';
      } else {
        toast('Already logged out.');
        return '/login';
      }
    } catch (error) {
      toast('Logout failed! Please try again.');
      console.error('Logout failed:', error);
      return false;
    }
  }, [logoutMutation]);

  const value: UserProviderState = {
    user: currentUser,
    loading,
    error: error ?? null,
    refetchUser: refetch,
    logout,
  };

  return (
    <UserProviderContext.Provider value={value}>
      {children}
    </UserProviderContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserProviderContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

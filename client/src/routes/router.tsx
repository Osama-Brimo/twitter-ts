import { createBrowserRouter } from 'react-router-dom';
import Root from './Root';
import Home from './Home';
import Signup from './Signup';
import Login from './Login';
import Profile from './user/Profile';
import Tweet from './user/tweet/Tweet';
import Search from './Search';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Root />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: ':handle',
          element: <Profile />,
          children: [
            {
              path: 'tweet/:id',
              element: <Tweet />,
            },
            {
              path: 'posts',
              element: <Profile />,
            },
            {
              path: 'likes',
              element: <Profile />,
            },
            {
              path: 'followers',
              element: <Profile />,
            },
            {
              path: 'following',
              element: <Profile />,
            },
          ],
        },
        {
          path: '/search',
          element: <Search />
        },
      ],
    },
    {
      path: '/signup',
      element: <Signup />,
    },
    {
      path: '/login',
      element: <Login />,
    },
  ],
  {
    future: {
      // Normalize `useNavigation()`/`useFetcher()` `formMethod` to uppercase
      v7_normalizeFormMethod: true,
    },
  },
);

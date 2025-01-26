import { createBrowserRouter } from 'react-router-dom';
import Root from './Root';
import Home from './Home';
import Signup from './Signup';
import Login from './Login';
import Profile from './user/Profile';
import Tweet from './user/tweet/Tweet';
import Search from './Search';
import Explore from './Explore';
import NotFound from "@/components/app/NotFound";

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
          path: '/explore',
          element: <Explore />,
        },
        {
          path: '/user/:handle',
          element: <Profile />,
          children: [
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
          path: '/tweet/:id',
          element: <Tweet />,
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
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    future: {
      // Normalize `useNavigation()`/`useFetcher()` `formMethod` to uppercase
      v7_normalizeFormMethod: true,
    },
  },
);

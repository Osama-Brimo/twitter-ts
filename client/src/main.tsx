import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider.tsx';
import { AppProvider } from './context/AppProvider.tsx';
import { UserProvider } from './context/UserProvider.tsx';
import { client } from './lib/apollo.ts';
import { router } from './routes/router.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AppProvider>
        <UserProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </UserProvider>
      </AppProvider>
    </ApolloProvider>
  </React.StrictMode>,
);

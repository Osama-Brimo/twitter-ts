import { createContext, useContext, useEffect, useState } from 'react';

type AppProviderProps = {
  children: React.ReactNode;
};

type AppProviderState = {};

const initialState = {};

const AppProviderContext = createContext<AppProviderState>(initialState);

export const AppProvider = ({ children }: AppProviderProps) => {
  const value: AppProviderState = {};

  return (
    <AppProviderContext.Provider value={value}>
      {children}
    </AppProviderContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppProviderContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

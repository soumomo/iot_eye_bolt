import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CommunicationMode = 'keyword' | 'number' | 'letter' | null;

interface AppContextType {
  selectedMode: CommunicationMode;
  setSelectedMode: (mode: CommunicationMode) => void;
  currentScreen: 'mode-selection' | 'detection';
  setCurrentScreen: (screen: 'mode-selection' | 'detection') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedMode, setSelectedMode] = useState<CommunicationMode>(null);
  const [currentScreen, setCurrentScreen] = useState<'mode-selection' | 'detection'>('mode-selection');

  return (
    <AppContext.Provider value={{
      selectedMode,
      setSelectedMode,
      currentScreen,
      setCurrentScreen
    }}>
      {children}
    </AppContext.Provider>
  );
};

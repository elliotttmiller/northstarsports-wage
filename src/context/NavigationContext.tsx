import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NavigationState } from '@/types';

interface NavigationContextType {
  navigation: NavigationState;
  selectSport: (sportId: string | null) => void;
  selectLeague: (leagueId: string | null) => void;
  setMobilePanel: (panel: 'navigation' | 'workspace' | 'betslip' | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [navigation, setNavigation] = useState<NavigationState>({
    selectedSport: null,
    selectedLeague: null,
    mobilePanel: null
  });

  const selectSport = (sportId: string | null) => {
    setNavigation(prev => ({
      ...prev,
      selectedSport: sportId,
      selectedLeague: null // Reset league when sport changes
    }));
  };

  const selectLeague = (leagueId: string | null) => {
    setNavigation(prev => ({
      ...prev,
      selectedLeague: leagueId
    }));
  };

  const setMobilePanel = (panel: 'navigation' | 'workspace' | 'betslip' | null) => {
    setNavigation(prev => ({
      ...prev,
      mobilePanel: panel
    }));
  };

  const value: NavigationContextType = {
    navigation,
    selectSport,
    selectLeague,
    setMobilePanel
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
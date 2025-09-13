import { createContext, useContext, useState, ReactNode } from 'react'

type MobilePanel = 'navigation' | 'workspace' | 'betslip' | null

interface NavigationContextType {
  navigation: {
    mobilePanel: MobilePanel
    selectedSport: string | null
    selectedLeague: string | null
  }
  setMobilePanel: (panel: MobilePanel) => void
  selectSport: (sport: string) => void
  selectLeague: (league: string) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)
  const [selectedSport, setSelectedSport] = useState<string | null>('football')
  const [selectedLeague, setSelectedLeague] = useState<string | null>('nfl')

  return (
    <NavigationContext.Provider
      value={{
        navigation: { 
          mobilePanel, 
          selectedSport,
          selectedLeague 
        },
        setMobilePanel,
        selectSport: setSelectedSport,
        selectLeague: setSelectedLeague
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}
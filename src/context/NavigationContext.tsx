import { createContext, useContext, useState, ReactNode } from 'react'

type MobilePanel = 'navigation' | 'workspace' | 'betslip' | null

interface NavigationContextType {
  navigation: {
    mobilePanel: MobilePanel
    selectedSport: string | null
    selectedLeague: string | null
    sideNavOpen: boolean
    actionHubOpen: boolean
  }
  setMobilePanel: (panel: MobilePanel) => void
  selectSport: (sport: string) => void
  selectLeague: (league: string) => void
  toggleSideNav: () => void
  toggleActionHub: () => void
  setSideNavOpen: (open: boolean) => void
  setActionHubOpen: (open: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)
  const [selectedSport, setSelectedSport] = useState<string | null>('football')
  const [selectedLeague, setSelectedLeague] = useState<string | null>('nfl')
  const [sideNavOpen, setSideNavOpen] = useState(true)
  const [actionHubOpen, setActionHubOpen] = useState(true)

  const toggleSideNav = () => setSideNavOpen(!sideNavOpen)
  const toggleActionHub = () => setActionHubOpen(!actionHubOpen)

  return (
    <NavigationContext.Provider
      value={{
        navigation: { 
          mobilePanel, 
          selectedSport,
          selectedLeague,
          sideNavOpen,
          actionHubOpen
        },
        setMobilePanel,
        selectSport: setSelectedSport,
        selectLeague: setSelectedLeague,
        toggleSideNav,
        toggleActionHub,
        setSideNavOpen,
        setActionHubOpen
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
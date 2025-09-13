import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Header } from '../Header'
import { BottomNav } from '../BottomNav'
import { SideNavPanel } from '../panels/SideNavPanel'
import { ActionHubPanel } from '../panels/ActionHubPanel'
import { NavigationProvider } from '../../context/NavigationContext'
import { BetSlipProvider } from '../../context/BetSlipContext'
import { useNavigation } from '../../context/NavigationContext'
import { Toaster } from '@/components/ui/sonner'

function LayoutContent() {
  const { navigation, setMobilePanel } = useNavigation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - Always visible */}
      <Header />
      
      {/* Main Layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr_350px] lg:h-[calc(100vh-4rem)]">
        {/* Side Navigation Panel */}
        <div className={`
          ${isMobile 
            ? `fixed inset-0 top-16 z-50 transform transition-transform duration-300 ${
                navigation.mobilePanel === 'navigation' ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'border-r border-border'
          }
        `}>
          <SideNavPanel />
        </div>

        {/* Main Workspace Panel - Contains routed content */}
        <div className={`
          flex-1
          ${isMobile 
            ? `${navigation.mobilePanel === 'workspace' || !navigation.mobilePanel ? 'block' : 'hidden'}`
            : 'block'
          }
        `}>
          <Outlet />
        </div>

        {/* Action Hub Panel (Bet Slip) */}
        <div className={`
          ${isMobile 
            ? `fixed inset-0 top-16 z-50 transform transition-transform duration-300 ${
                navigation.mobilePanel === 'betslip' ? 'translate-x-0' : 'translate-x-full'
              }`
            : 'border-l border-border'
          }
        `}>
          <ActionHubPanel />
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && <BottomNav />}

      {/* Mobile overlay backdrop */}
      {isMobile && navigation.mobilePanel && navigation.mobilePanel !== 'workspace' && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobilePanel(null)}
        />
      )}
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export function RootLayout() {
  return (
    <NavigationProvider>
      <BetSlipProvider>
        <LayoutContent />
      </BetSlipProvider>
    </NavigationProvider>
  )
}
import { Outlet } from 'react-router-dom'
import { Header } from '../Header'
import { BottomNav } from '../BottomNav'
import { SideNavPanel } from '../panels/SideNavPanel'
import { ActionHubPanel } from '../panels/ActionHubPanel'
import { FloatingBetSlipButton } from '../FloatingBetSlipButton'
import { BetSlipModal } from '../BetSlipModal'
import { NavigationProvider, useNavigation } from '../../context/NavigationContext'
import { BetSlipProvider } from '../../context/BetSlipContext'
import { Toaster } from '@/components/ui/sonner'
import { SidebarToggle } from '../SidebarToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

function LayoutContent() {
  const { navigation, setMobilePanel, toggleSideNav, toggleActionHub, setIsBetSlipOpen } = useNavigation()
  const isMobile = useIsMobile()

  const handleBetSlipToggle = () => {
    setIsBetSlipOpen(!navigation.isBetSlipOpen)
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header - Always visible */}
      <Header />
      
      {/* Main Layout Container */}
      <div className="flex-1 overflow-hidden relative">
        {/* Desktop Layout - 3-panel grid with overlay bet slip */}
        <div className="hidden lg:flex h-full relative">
          {/* Desktop Sidebar Toggles */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30">
            <SidebarToggle
              side="left"
              isOpen={navigation.sideNavOpen}
              onToggle={toggleSideNav}
            />
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30">
            <SidebarToggle
              side="right"
              isOpen={navigation.actionHubOpen}
              onToggle={toggleActionHub}
            />
          </div>

          {/* Left Panel - Side Navigation (Compact) */}
          <AnimatePresence mode="wait">
            {navigation.sideNavOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="border-r border-border overflow-hidden bg-card/50 backdrop-blur-sm"
              >
                <SideNavPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Panel - Full width without right panel interference */}
          <div className="flex-1 min-w-0 overflow-hidden relative">
            <Outlet />
            
            {/* Desktop Bet Slip Overlay - Appears over main content */}
            <AnimatePresence mode="wait">
              {navigation.actionHubOpen && (
                <motion.div
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute top-0 right-0 bottom-0 w-96 bg-card/95 backdrop-blur-md border-l border-border z-40 shadow-2xl"
                >
                  <ActionHubPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden h-full flex flex-col pb-16">
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>

          {/* Mobile Navigation Overlay */}
          <AnimatePresence mode="wait">
            {navigation.mobilePanel === 'navigation' && (
              <motion.div
                key="mobile-sidenav"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="fixed inset-0 top-16 z-40 bg-card"
              >
                <SideNavPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <BottomNav />
        </div>
      )}
      
      {/* Mobile Floating Bet Slip Button */}
      {isMobile && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <FloatingBetSlipButton onToggle={handleBetSlipToggle} />
        </div>
      )}

      {/* Mobile Bet Slip Modal */}
      {isMobile && <BetSlipModal />}

      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isMobile && navigation.mobilePanel && navigation.mobilePanel !== 'workspace' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-30"
            onClick={() => setMobilePanel(null)}
          />
        )}
      </AnimatePresence>
      
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
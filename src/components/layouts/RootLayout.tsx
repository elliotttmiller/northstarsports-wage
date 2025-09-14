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

function LayoutContent() {
  const { navigation, setMobilePanel, toggleSideNav, toggleActionHub } = useNavigation()

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header - Always visible */}
      <Header />
      
      {/* Main Layout - Desktop: 3-panel grid, Mobile: single panel with overlays */}
      <div className="flex-1 overflow-hidden relative lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-0">
        
        {/* Desktop Sidebar Toggles - Only on large screens */}
        <div className="hidden lg:block">
          <SidebarToggle
            side="left"
            isOpen={navigation.sideNavOpen}
            onToggle={toggleSideNav}
          />
        </div>
        
        <div className="hidden lg:block">
          <SidebarToggle
            side="right"
            isOpen={navigation.actionHubOpen}
            onToggle={toggleActionHub}
          />
        </div>

        {/* Left Panel - Side Navigation */}
        <AnimatePresence mode="wait">
          {/* Mobile: Slide-in overlay */}
          {navigation.mobilePanel === 'navigation' && (
            <motion.div
              key="mobile-sidenav"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="lg:hidden fixed inset-0 top-16 z-40 bg-card"
            >
              <SideNavPanel />
            </motion.div>
          )}
          
          {/* Desktop: Collapsible sidebar */}
          {navigation.sideNavOpen && (
            <motion.div
              key="desktop-sidenav"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="hidden lg:block border-r border-border overflow-hidden"
            >
              <SideNavPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Panel - Always visible */}
        <div className="flex-1 min-w-0 overflow-hidden pb-20 lg:pb-0">
          <Outlet />
        </div>

        {/* Right Panel - Action Hub (Desktop only, mobile uses modal) */}
        <AnimatePresence mode="wait">
          {navigation.actionHubOpen && (
            <motion.div
              key="desktop-actionhub"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="hidden lg:block border-l border-border overflow-hidden"
            >
              <ActionHubPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>
      
      {/* Mobile Floating Bet Slip Button */}
      <div className="lg:hidden fixed inset-0 pointer-events-none z-50">
        <FloatingBetSlipButton />
      </div>

      {/* Mobile Bet Slip Modal */}
      <div className="lg:hidden">
        <BetSlipModal />
      </div>

      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {navigation.mobilePanel && navigation.mobilePanel !== 'workspace' && navigation.mobilePanel !== 'betslip' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
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
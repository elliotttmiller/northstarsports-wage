import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Header } from '../Header'
import { BottomNav } from '../BottomNav'
import { SideNavPanel } from '../panels/SideNavPanel'
import { ActionHubPanel } from '../panels/ActionHubPanel'
import { BuilderPanel } from '../panels/BuilderPanel'
import { FloatingBetSlipButton } from '../FloatingBetSlipButton'
import { NavigationProvider } from '../../context/NavigationContext'
import { BetSlipProvider } from '../../context/BetSlipContext'
import { useNavigation } from '../../context/NavigationContext'
import { Toaster } from '@/components/ui/sonner'
import { SidebarToggle } from '../SidebarToggle'
import { motion, AnimatePresence } from 'framer-motion'

function LayoutContent() {
  const { navigation, setMobilePanel, toggleSideNav, toggleActionHub } = useNavigation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header - Always visible */}
      <Header />
      
      {/* Main Layout - Takes remaining height */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Sidebar Toggles */}
        {!isMobile && (
          <>
            <SidebarToggle
              side="left"
              isOpen={navigation.sideNavOpen}
              onToggle={toggleSideNav}
            />
            <SidebarToggle
              side="right"
              isOpen={navigation.actionHubOpen}
              onToggle={toggleActionHub}
            />
          </>
        )}

        {/* Side Navigation Panel */}
        <AnimatePresence mode="wait" key="sidenav-presence">
          {(isMobile || navigation.sideNavOpen) && (
            <motion.div
              key="sidenav"
              initial={isMobile ? { x: '-100%' } : { width: 0, opacity: 0 }}
              animate={
                isMobile 
                  ? { x: 0 }
                  : { width: 300, opacity: 1 }
              }
              exit={
                isMobile 
                  ? { x: '-100%' }
                  : { width: 0, opacity: 0 }
              }
              transition={{ 
                duration: 0.35, 
                ease: [0.23, 1, 0.32, 1],
                width: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
                opacity: { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
              }}
              style={{
                willChange: 'transform, width, opacity'
              }}
              className={`
                ${isMobile 
                  ? `fixed inset-0 top-16 z-40 ${
                      navigation.mobilePanel === 'navigation' ? 'block' : 'hidden'
                    } bg-card`
                  : 'border-r border-border overflow-hidden flex-shrink-0 animate-optimized sidebar-transition'
                }
              `}
            >
              <SideNavPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace Panel - Contains routed content */}
        <div className={`
          flex-1 overflow-hidden min-w-0 layout-container
          ${isMobile 
            ? `${navigation.mobilePanel === 'workspace' || !navigation.mobilePanel ? 'block' : 'hidden'}`
            : 'block'
          }
        `}>
          <Outlet />
        </div>

        {/* Action Hub Panel (Bet Slip) */}
        <AnimatePresence mode="wait" key="actionhub-presence">
          {(isMobile || navigation.actionHubOpen) && (
            <motion.div
              key="actionhub"
              initial={isMobile ? { x: '100%' } : { width: 0, opacity: 0 }}
              animate={
                isMobile 
                  ? { x: 0 }
                  : { width: 350, opacity: 1 }
              }
              exit={
                isMobile 
                  ? { x: '100%' }
                  : { width: 0, opacity: 0 }
              }
              transition={{ 
                duration: 0.35, 
                ease: [0.23, 1, 0.32, 1],
                width: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
                opacity: { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
              }}
              style={{
                willChange: 'transform, width, opacity'
              }}
              className={`
                ${isMobile 
                  ? `fixed inset-0 top-16 z-40 ${
                      navigation.mobilePanel === 'betslip' ? 'block' : 'hidden'
                    } bg-card`
                  : 'border-l border-border overflow-hidden flex-shrink-0 animate-optimized sidebar-transition'
                }
              `}
            >
              <ActionHubPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Builder Panel - Mobile only */}
        {isMobile && (
          <AnimatePresence mode="wait" key="builder-presence">
            {navigation.mobilePanel === 'builder' && (
              <motion.div
                key="builder"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ 
                  duration: 0.35, 
                  ease: [0.23, 1, 0.32, 1]
                }}
                style={{
                  willChange: 'transform'
                }}
                className="fixed inset-0 top-16 z-40 bg-card"
              >
                <BuilderPanel />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Navigation - Mobile only, always visible */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <BottomNav />
        </div>
      )}
      
      {/* Floating Bet Slip Button - Mobile only, highest z-index */}
      {isMobile && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <FloatingBetSlipButton />
        </div>
      )}

      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isMobile && navigation.mobilePanel && navigation.mobilePanel !== 'workspace' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobilePanel(null)}
          />
        )}
      </AnimatePresence>
      
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
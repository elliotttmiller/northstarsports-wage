import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { House, Receipt, GameController, ChartLineUp } from '@phosphor-icons/react';

export const BottomNav = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const { betSlip } = useBetSlip();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around z-30 px-2">
      {/* Bets */}
      <button
        onClick={() => setMobilePanel(navigation.mobilePanel === 'betslip' ? null : 'betslip')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
          navigation.mobilePanel === 'betslip'
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground hover:scale-105'
        }`}
      >
        <div className="relative">
          <Receipt size={20} weight={navigation.mobilePanel === 'betslip' ? 'fill' : 'regular'} />
          {betSlip.bets.length > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-semibold animate-pulse">
              {betSlip.bets.length}
            </div>
          )}
        </div>
        <span className="text-xs font-medium">Bets</span>
      </button>

      {/* Games */}
      <button
        onClick={() => setMobilePanel(navigation.mobilePanel === 'navigation' ? null : 'navigation')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
          navigation.mobilePanel === 'navigation' 
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground hover:scale-105'
        }`}
      >
        <GameController size={20} weight={navigation.mobilePanel === 'navigation' ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Games</span>
      </button>

      {/* Home - Center button */}
      <Link
        to="/"
        className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 min-w-[70px] ${
          location.pathname === '/' 
            ? 'bg-accent text-accent-foreground scale-110 shadow-lg' 
            : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground hover:scale-110 shadow-md'
        }`}
        onClick={() => setMobilePanel(null)}
      >
        <House size={24} weight={location.pathname === '/' ? 'fill' : 'regular'} />
        <span className="text-xs font-semibold">Home</span>
      </Link>

      {/* Analytics */}
      <Link
        to="/my-bets"
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
          location.pathname === '/my-bets' 
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground hover:scale-105'
        }`}
        onClick={() => setMobilePanel(null)}
      >
        <ChartLineUp size={20} weight={location.pathname === '/my-bets' ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">My Bets</span>
      </Link>

      {/* Workspace toggle */}
      <button
        onClick={() => setMobilePanel('workspace')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
          navigation.mobilePanel === 'workspace' || !navigation.mobilePanel
            ? 'bg-accent text-accent-foreground scale-105'
            : 'text-muted-foreground hover:text-foreground hover:scale-105'
        }`}
      >
        <ChartLineUp size={20} weight={navigation.mobilePanel === 'workspace' || !navigation.mobilePanel ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Live</span>
      </button>
    </nav>
  );
};
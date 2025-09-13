import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { House, Receipt, GameController, ChartLineUp } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const { betSlip } = useBetSlip();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSportsClick = () => {
    // Smooth navigation to games page
    setMobilePanel(null);
    navigate('/games');
  };

  const handleBetsClick = () => {
    if (navigation.mobilePanel === 'betslip') {
      setMobilePanel(null);
    } else {
      setMobilePanel('betslip');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border h-16 flex items-center justify-around z-30 px-2">
      {/* Bets - Left */}
      <motion.button
        onClick={handleBetsClick}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
          navigation.mobilePanel === 'betslip'
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Receipt size={20} weight={navigation.mobilePanel === 'betslip' ? 'fill' : 'regular'} />
          {betSlip.bets.length > 0 && (
            <motion.div 
              className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-semibold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {betSlip.bets.length}
            </motion.div>
          )}
        </div>
        <span className="text-xs font-medium">Bets</span>
      </motion.button>

      {/* Sports - Left Center */}
      <motion.button
        onClick={handleSportsClick}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
          location.pathname === '/games'
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <GameController size={20} weight={location.pathname === '/games' ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Sports</span>
      </motion.button>

      {/* Home - Center button */}
      <motion.div
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/"
          className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 min-w-[70px] ${
            location.pathname === '/' 
              ? 'bg-accent text-accent-foreground scale-110 shadow-xl' 
              : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground shadow-lg'
          }`}
          onClick={() => setMobilePanel(null)}
        >
          <House size={24} weight={location.pathname === '/' ? 'fill' : 'regular'} />
          <span className="text-xs font-semibold">Home</span>
        </Link>
      </motion.div>

      {/* My Bets - Right Center */}
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/my-bets"
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
            location.pathname === '/my-bets' 
              ? 'bg-accent text-accent-foreground scale-105' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setMobilePanel(null)}
        >
          <ChartLineUp size={20} weight={location.pathname === '/my-bets' ? 'fill' : 'regular'} />
          <span className="text-xs font-medium">Analytics</span>
        </Link>
      </motion.div>

      {/* Live - Right */}
      <motion.button
        onClick={() => setMobilePanel(navigation.mobilePanel === 'workspace' ? null : 'workspace')}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
          navigation.mobilePanel === 'workspace'
            ? 'bg-accent text-accent-foreground scale-105'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <ChartLineUp size={20} weight={navigation.mobilePanel === 'workspace' ? 'fill' : 'regular'} />
          <motion.div 
            className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-xs font-medium">Live</span>
      </motion.button>
    </nav>
  );
};
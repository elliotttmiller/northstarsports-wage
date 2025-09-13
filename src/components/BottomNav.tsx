import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { House, Receipt, GameController, DotsThree } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export const BottomNav = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const { betSlip } = useBetSlip();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSportsClick = () => {
    // On mobile, show navigation panel to select sports/leagues
    if (isMobile) {
      if (navigation.mobilePanel === 'navigation') {
        setMobilePanel(null);
      } else {
        setMobilePanel('navigation');
      }
    } else {
      // Desktop: navigate to games page
      setMobilePanel(null);
      navigate('/games');
    }
  };

  const handleBetsClick = () => {
    if (navigation.mobilePanel === 'betslip') {
      setMobilePanel(null);
    } else {
      setMobilePanel('betslip');
    }
  };

  const handleOtherClick = () => {
    setMobilePanel(null);
    navigate('/other');
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
          (location.pathname === '/games' && !isMobile) || navigation.mobilePanel === 'navigation'
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <GameController size={20} weight={(location.pathname === '/games' && !isMobile) || navigation.mobilePanel === 'navigation' ? 'fill' : 'regular'} />
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
          <Receipt size={20} weight={location.pathname === '/my-bets' ? 'fill' : 'regular'} />
          <span className="text-xs font-medium">My Bets</span>
        </Link>
      </motion.div>

      {/* Other - Right */}
      <motion.button
        onClick={handleOtherClick}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
          location.pathname === '/other'
            ? 'bg-accent text-accent-foreground scale-105'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <DotsThree size={20} weight={location.pathname === '/other' ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Other</span>
      </motion.button>
    </nav>
  );
};
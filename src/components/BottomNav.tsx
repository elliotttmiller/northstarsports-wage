import React from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { motion } from 'framer-motion';

import { useIsMobile } from '@/hooks/useIsMobile';
import { motion } from 'framer-motion';
import { GameController, Wrench, House, Receipt, DotsThree } from '@phosphor-icons/react';


  const location = useLocation();
      // On mobile, show navigati
  const isMobile = useIsMobile();
      } else {
  const { setMobilePanel } = navigation;
      }
  const handleSportsClick = () => {
    if (isMobile) {
      // On mobile, show navigation panel to select sports/leagues
      if (navigation.mobilePanel === 'navigation') {
        setMobilePanel(null);
      } else {

  const handleBuilderClick = () => {
    setMobilePanel(null);
    navigate('/builder');
  };

  const handleOtherClick = () => {
    setMobilePanel(null);
    navigate('/other');
  };

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-t border-border h-16 flex items-center justify-around px-2 w-full">
      {/* Sports - Far Left */}
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

      {/* Builder - Left Center */}
      <motion.button
        onClick={handleBuilderClick}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
          location.pathname === '/builder'
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wrench size={20} weight={location.pathname === '/builder' ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Builder</span>
      </motion.button>

      {/* Home - Center (Elevated) */}
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
          <span className="text-xs font-medium">Bets</span>
        </Link>
      </motion.div>

      {/* Other - Far Right */}
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
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { House, Receipt, GameController, DotsThree, Wrench }

import { House, Receipt, GameController, DotsThree, Wrench } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

// Custom hook for mobile detection
    const checkMobile = () 
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  const l


};

export const BottomNav = () => {
  const { navigation, setMobilePanel } = useNavigation();
  const { betSlip } = useBetSlip();
    } else {
  const navigate = useNavigate();
  const isMobile = useIsMobile();


    // On mobile, show navigation panel to select sports/leagues
    setMobilePanel(
      if (navigation.mobilePanel === 'navigation') {
        setMobilePanel(null);
      } else {
        setMobilePanel('navigation');
      }
  return (
      // Desktop: navigate to games page
      setMobilePanel(null);
      navigate('/games');
    }
  };

  const handleBuilderClick = () => {
      >
    setMobilePanel(null);
      </motion.button>
  };

  const handleOtherClick = () => {
          location.pathna
    navigate('/other');
    

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-t border-border h-16 flex items-center justify-around px-2 w-full">
      </motion.button>
      <motion.button
      <motion.div
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
          (location.pathname === '/games' && !isMobile) || navigation.mobilePanel === 'navigation'
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
       
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
          o
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wrench size={20} weight={location.pathname === '/builder' ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Builder</span>
      </motion.button>

            ? 'bg-accent text-acce
      <motion.div
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.95 }}
       
        <Link
    </nav>
          className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 min-w-[70px] ${
            location.pathname === '/' 
              ? 'bg-accent text-accent-foreground scale-110 shadow-xl' 
              : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground shadow-lg'
          }`}
          onClick={() => setMobilePanel(null)}
        >
          <House size={24} weight={location.pathname === '/' ? 'fill' : 'regular'} />
          <span className="text-xs font-semibold">Home</span>

      </motion.div>

      {/* My Bets - Right Center */}
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >

          to="/my-bets"
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
            location.pathname === '/my-bets' 
              ? 'bg-accent text-accent-foreground scale-105' 
              : 'text-muted-foreground hover:text-foreground'

          onClick={() => setMobilePanel(null)}

          <Receipt size={20} weight={location.pathname === '/my-bets' ? 'fill' : 'regular'} />

        </Link>



      <motion.button
        onClick={handleOtherClick}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${

            ? 'bg-accent text-accent-foreground scale-105'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}

        <DotsThree size={20} weight={location.pathname === '/other' ? 'fill' : 'regular'} />

      </motion.button>

  );
};
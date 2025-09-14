import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import { useBetSlip } from '@/context/BetSlipContext';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import { GameController, House, Receipt, DotsThree, Lightning } from '@phosphor-icons/react';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigation, setMobilePanel } = useNavigation();
  const { betSlip } = useBetSlip();
  const isMobile = useIsMobile();

  const handleBetsClick = () => {
    setMobilePanel(null);
    navigate('/my-bets');
  };

  const handleSportsClick = () => {
    if (isMobile) {
      // On mobile, show navigation panel to select sports/leagues
      if (navigation.mobilePanel === 'navigation') {
        setMobilePanel(null);
      } else {
        setMobilePanel('navigation');
      }
    } else {
      // On desktop, navigate to games page
      setMobilePanel(null);
      navigate('/games');
    }
  };

  const handleLiveClick = () => {
    setMobilePanel(null);
    navigate('/games?filter=live');
  };

  const handleOtherClick = () => {
    setMobilePanel(null);
    navigate('/other');
  };

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-t border-border h-16 flex items-center justify-between px-2 w-full">
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

      {/* Live - Left of Center */}
      <motion.button
        onClick={handleLiveClick}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] ${
          location.search.includes('filter=live')
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Lightning size={20} weight={location.search.includes('filter=live') ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Live</span>
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

      {/* Bets - Right of Center */}
      <motion.button
        onClick={handleBetsClick}
        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 min-w-[60px] relative ${
          location.pathname === '/my-bets'
            ? 'bg-accent text-accent-foreground scale-105' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Receipt size={20} weight={location.pathname === '/my-bets' ? 'fill' : 'regular'} />
        <span className="text-xs font-medium">Bets</span>
        {betSlip.bets.length > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-medium">
            {betSlip.bets.length}
          </div>
        )}
      </motion.button>

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
}
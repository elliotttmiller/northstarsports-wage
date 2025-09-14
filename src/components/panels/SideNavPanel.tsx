import { useState, useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { Sport } from '@/types';
import { getSports } from '@/services/mockApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { SmoothScrollContainer } from '@/components/VirtualScrolling';
import { motion } from 'framer-motion';

export const SideNavPanel = () => {
  const { navigation, selectSport, selectLeague, setMobilePanel } = useNavigation();
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSports = async () => {
      try {
        const sportsData = await getSports();
        setSports(sportsData);
      } catch (error) {
        console.error('Failed to load sports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSports();
  }, []);

  const handleSportClick = (sportId: string) => {
    // Only expand/collapse the accordion, don't navigate
    selectSport(navigation.selectedSport === sportId ? '' : sportId);
  };

  const handleLeagueClick = (leagueId: string) => {
    // Find which sport this league belongs to
    const sport = sports.find(s => s.leagues.some(l => l.id === leagueId));
    if (sport) {
      selectSport(sport.id);
    }
    selectLeague(leagueId);
    
    // Navigate to games page on both desktop and mobile
    setTimeout(() => {
      navigate('/games');
    }, 150);
    
    // Close mobile panel if mobile
    if (window.innerWidth < 1024) {
      setMobilePanel(null);
    }
  };

  const renderSportItem = (sport: Sport, index: number) => {
    const isExpanded = navigation.selectedSport === sport.id;
    
    return (
      <AccordionItem key={sport.id} value={sport.id} className="border-border">
        <AccordionTrigger
          className={`text-left hover:no-underline px-2 py-2 transition-all duration-200 ${
            isExpanded ? 'bg-muted/50' : 'hover:bg-muted/30'
          }`}
        >
          <motion.div 
            className="flex items-center space-x-2 w-full"
            whileHover={{ x: 1 }}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isExpanded ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                isExpanded ? 'bg-primary' : 'bg-primary/70'
              }`} />
            </div>
            <span className={`font-medium text-sm transition-colors duration-200 ${
              isExpanded ? 'text-card-foreground' : 'text-card-foreground/80'
            }`}>
              {sport.name}
            </span>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {sport.leagues.length}
            </span>
          </motion.div>
        </AccordionTrigger>
        <AccordionContent className="pb-1">
          <div className="ml-6 space-y-0.5">
            {sport.leagues.map((league, leagueIndex) => (
              <motion.button
                key={league.id}
                onClick={() => handleLeagueClick(league.id)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all duration-300 ${
                  navigation.selectedLeague === league.id
                    ? 'bg-accent text-accent-foreground shadow-sm scale-[1.02]'
                    : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.2, 
                  delay: leagueIndex * 0.03,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{league.name}</span>
                  <span className="text-xs opacity-60">
                    {league.games.length}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (loading) {
    return (
      <div className="h-full bg-card flex flex-col overflow-hidden">
        <motion.div 
          className="p-3 border-b border-border flex-shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-base font-semibold text-card-foreground">Sports</h2>
          <p className="text-xs text-muted-foreground">Loading sports...</p>
        </motion.div>
        <div className="flex-1">
          <SkeletonLoader type="navigation" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card flex flex-col overflow-hidden">
      {/* Header - Compact Sports header */}
      <motion.div 
        className="p-3 border-b border-border flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-base font-semibold text-card-foreground">Sports</h2>
        <p className="text-xs text-muted-foreground">Select league to view games</p>
      </motion.div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full seamless-scroll overflow-y-auto p-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="space-y-1">
              <Accordion 
                type="single" 
                collapsible 
                value={navigation.selectedSport || undefined}
                onValueChange={(value) => {
                  if (value) {
                    selectSport(value);
                  }
                }}
              >
                {sports.map((sport, index) => (
                  <motion.div
                    key={sport.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                  >
                    {renderSportItem(sport, index)}
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
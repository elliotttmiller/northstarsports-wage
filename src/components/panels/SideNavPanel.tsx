import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { Sport } from '@/types';
import { getSports } from '@/services/mockApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { VirtualScrollContainer, SmoothScrollContainer } from '@/components/VirtualScrolling';
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
    selectSport(sportId);
    // On mobile, navigate to games page smoothly
    if (window.innerWidth < 1024) {
      setMobilePanel(null);
      setTimeout(() => {
        navigate('/games');
      }, 100);
    }
  };

  const handleLeagueClick = (leagueId: string) => {
    selectLeague(leagueId);
    // On mobile, navigate to games page smoothly
    if (window.innerWidth < 1024) {
      setMobilePanel(null);
      setTimeout(() => {
        navigate('/games');
      }, 150);
    }
  };

  const renderSportItem = (sport: Sport, index: number) => (
    <AccordionItem key={sport.id} value={sport.id} className="border-border">
      <AccordionTrigger
        className="text-left hover:no-underline px-2"
        onClick={() => handleSportClick(sport.id)}
      >
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ x: 2 }}
        >
          <span className="text-xl">{sport.icon}</span>
          <span className="font-medium text-card-foreground">{sport.name}</span>
        </motion.div>
      </AccordionTrigger>
      <AccordionContent className="pb-2">
        <div className="ml-8 space-y-1">
          {sport.leagues.map((league) => (
            <motion.button
              key={league.id}
              onClick={() => handleLeagueClick(league.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 ${
                navigation.selectedLeague === league.id
                  ? 'bg-accent text-accent-foreground shadow-sm scale-105'
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted hover:scale-102'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.2, 
                delay: sport.leagues.indexOf(league) * 0.05,
                ease: [0.4, 0.0, 0.2, 1]
              }}
            >
              <div className="flex items-center justify-between">
                <span>{league.name}</span>
                <span className="text-xs opacity-70">
                  {league.games.length} games
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  if (loading) {
    return (
      <div className="h-full bg-card flex flex-col overflow-hidden">
        <motion.div 
          className="p-4 border-b border-border flex-shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-card-foreground">Sports</h2>
          <p className="text-sm text-muted-foreground">Select a sport to view games</p>
        </motion.div>
        <div className="flex-1">
          <SkeletonLoader type="navigation" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card flex flex-col overflow-hidden">
      <motion.div 
        className="p-4 border-b border-border flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-card-foreground">Sports</h2>
        <p className="text-sm text-muted-foreground">Select a sport to view games</p>
      </motion.div>

      <SmoothScrollContainer className="flex-1 p-2" showScrollbar={false}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Accordion type="single" collapsible value={navigation.selectedSport || undefined}>
            {sports.map((sport, index) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                whileHover={{ scale: 1.01 }}
              >
                {renderSportItem(sport, index)}
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </SmoothScrollContainer>
    </div>
  );
};
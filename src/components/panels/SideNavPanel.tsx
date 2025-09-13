import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { Sport } from '@/types';
import { getSports } from '@/services/mockApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { VirtualScrollContainer, SmoothScrollContainer } from '@/components/VirtualScrolling';
import { motion } from 'framer-motion';

export const SideNavPanel = () => {
  const { navigation, selectSport, selectLeague } = useNavigation();
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

  const renderSportItem = (sport: Sport, index: number) => (
    <AccordionItem key={sport.id} value={sport.id} className="border-border">
      <AccordionTrigger
        className="text-left hover:no-underline px-2"
        onClick={() => selectSport(sport.id)}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{sport.icon}</span>
          <span className="font-medium text-card-foreground">{sport.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-2">
        <div className="ml-8 space-y-1">
          {sport.leagues.map((league) => (
            <motion.button
              key={league.id}
              onClick={() => selectLeague(league.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                navigation.selectedLeague === league.id
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {league.name}
              <span className="ml-2 text-xs opacity-70">
                ({league.games.length} games)
              </span>
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
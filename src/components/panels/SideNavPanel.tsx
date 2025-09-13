import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { Sport } from '@/types';
import { getSports } from '@/services/mockApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SkeletonLoader } from '@/components/SkeletonLoader';

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

  if (loading) {
    return (
      <div className="h-full bg-card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-card-foreground">Sports</h2>
          <p className="text-sm text-muted-foreground">Select a sport to view games</p>
        </div>
        <div className="flex-1">
          <SkeletonLoader type="navigation" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h2 className="text-lg font-semibold text-card-foreground">Sports</h2>
        <p className="text-sm text-muted-foreground">Select a sport to view games</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <Accordion type="single" collapsible value={navigation.selectedSport || undefined}>
          {sports.map((sport) => (
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
                    <button
                      key={league.id}
                      onClick={() => selectLeague(league.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        navigation.selectedLeague === league.id
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
                      }`}
                    >
                      {league.name}
                      <span className="ml-2 text-xs opacity-70">
                        ({league.games.length} games)
                      </span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
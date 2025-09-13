import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { Sport } from '@/types';
import { getSports } from '@/services/mockApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { VirtualScrollContainer, SmoothScrollContainer } from '@/components/VirtualScrolling';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Trophy, 
  Clock, 
  Settings, 
  BarChart3,
  Star,
  Zap,
  Activity
} from 'lucide-react';

export const SideNavPanel = () => {
  const { navigation, selectSport, selectLeague, setMobilePanel } = useNavigation();
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('sports');

  const betTypes = [
    { id: 'prop-builder', name: 'Prop Builder', icon: Target, description: 'Build custom player props' },
    { id: 'same-game-parlay', name: 'Same Game Parlay', icon: TrendingUp, description: 'Multiple bets from one game' },
    { id: 'player-props', name: 'Player Props', icon: Users, description: 'Individual player statistics' },
    { id: 'futures', name: 'Futures', icon: Trophy, description: 'Season-long outcomes' },
    { id: 'live-betting', name: 'Live Betting', icon: Activity, description: 'Real-time in-game betting' },
    { id: 'specials', name: 'Specials', icon: Star, description: 'Unique betting opportunities' }
  ];

  const quickActions = [
    { id: 'trending', name: 'Trending Bets', icon: TrendingUp },
    { id: 'boosted', name: 'Boosted Odds', icon: Zap },
    { id: 'popular', name: 'Popular Picks', icon: BarChart3 },
    { id: 'live', name: 'Live Now', icon: Clock }
  ];

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

  const handleBetTypeClick = (betTypeId: string) => {
    // Navigate to the other page with the specific bet type
    if (window.innerWidth < 1024) {
      setMobilePanel(null);
    }
    navigate(`/other?type=${betTypeId}`);
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

  const handleQuickActionClick = (actionId: string) => {
    if (window.innerWidth < 1024) {
      setMobilePanel(null);
    }
    
    switch (actionId) {
      case 'trending':
      case 'boosted':
      case 'popular':
      case 'live':
        navigate(`/games?filter=${actionId}`);
        break;
      default:
        navigate('/games');
    }
  };

  const renderSportItem = (sport: Sport, index: number) => {
    const isExpanded = navigation.selectedSport === sport.id;
    
    return (
      <AccordionItem key={sport.id} value={sport.id} className="border-border">
        <AccordionTrigger
          className={`text-left hover:no-underline px-2 transition-all duration-200 ${
            isExpanded ? 'bg-muted/50' : 'hover:bg-muted/30'
          }`}
        >
          <motion.div 
            className="flex items-center space-x-3 w-full"
            whileHover={{ x: 2 }}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isExpanded ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                isExpanded ? 'bg-primary' : 'bg-primary/70'
              }`} />
            </div>
            <span className={`font-medium transition-colors duration-200 ${
              isExpanded ? 'text-card-foreground' : 'text-card-foreground/80'
            }`}>
              {sport.name}
            </span>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {sport.leagues.length} leagues
            </span>
          </motion.div>
        </AccordionTrigger>
        <AccordionContent className="pb-2">
          <div className="ml-8 space-y-1">
            {sport.leagues.map((league, leagueIndex) => (
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
                  delay: leagueIndex * 0.05,
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
  };

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
      {/* Header with section tabs */}
      <motion.div 
        className="p-4 border-b border-border flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-card-foreground mb-3">Navigation</h2>
        <div className="flex gap-1">
          <Button
            variant={activeSection === 'sports' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('sports')}
            className="text-xs"
          >
            Sports
          </Button>
          <Button
            variant={activeSection === 'bets' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('bets')}
            className="text-xs"
          >
            Bet Types
          </Button>
          <Button
            variant={activeSection === 'quick' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSection('quick')}
            className="text-xs"
          >
            Quick
          </Button>
        </div>
      </motion.div>

      <SmoothScrollContainer className="flex-1 scrollbar-hide" showScrollbar={false}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4"
        >
          {activeSection === 'sports' && (
            <div className="space-y-2">
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
          )}

          {activeSection === 'bets' && (
            <div className="space-y-3">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-card-foreground mb-2">Professional Bet Types</h3>
                <div className="space-y-2">
                  {betTypes.map((betType, index) => {
                    const IconComponent = betType.icon;
                    return (
                      <motion.div
                        key={betType.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05
                        }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                          onClick={() => handleBetTypeClick(betType.id)}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <IconComponent className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                              <div className="font-medium text-sm">{betType.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {betType.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'quick' && (
            <div className="space-y-3">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-card-foreground mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05
                        }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                          onClick={() => handleQuickActionClick(action.id)}
                        >
                          <IconComponent className="h-5 w-5 text-primary mr-3" />
                          <span className="font-medium text-sm">{action.name}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </SmoothScrollContainer>
    </div>
  );
};
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBetSlip } from '@/context/BetSlipContext';
import { useNavigation } from '@/context/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Target, 
  TrendUp, 
  Trophy, 
  Timer,
  Basketball,
  Football,
  Hockey,
  Calculator,
  Lightning,
  Stack
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export const OtherPage = () => {
  const navigate = useNavigate();
  const { betSlip } = useBetSlip();
  const { setMobilePanel } = useNavigation();

  const betTypes = [
    {
      id: 'player-props',
      title: 'Player Props',
      description: 'Individual player statistics and performances',
      icon: User,
      color: 'bg-blue-500',
      action: () => {
        navigate('/games');
        toast.info('Browse games and expand them to find player props!');
      }
    },
    {
      id: 'parlay-builder',
      title: 'Parlay Builder',
      description: 'Combine multiple bets for bigger payouts',
      icon: Stack,
      color: 'bg-purple-500',
      action: () => {
        if (betSlip.bets.length === 0) {
          toast.info('Add some bets first, then switch to parlay mode in your bet slip!');
          navigate('/games');
        } else {
          setMobilePanel('betslip');
          toast.success('Your bets are ready! Switch to parlay mode in the bet slip.');
        }
      }
    },
    {
      id: 'prop-builder',
      title: 'Same Game Parlay',
      description: 'Mix player props and game lines from one game',
      icon: Target,
      color: 'bg-green-500',
      action: () => {
        navigate('/games');
        toast.info('Select a game and add both game lines and player props!');
      }
    },
    {
      id: 'live-betting',
      title: 'Live Betting',
      description: 'In-game betting with real-time odds updates',
      icon: Lightning,
      color: 'bg-red-500',
      action: () => {
        navigate('/games');
        toast.info('Look for games with LIVE badges for in-game betting!');
      }
    },
    {
      id: 'futures',
      title: 'Futures & Season',
      description: 'Championship odds and season-long props',
      icon: Trophy,
      color: 'bg-yellow-500',
      comingSoon: true
    },
    {
      id: 'team-props',
      title: 'Team Props',
      description: 'Team performance and statistical bets',
      icon: Basketball,
      color: 'bg-indigo-500',
      comingSoon: true
    }
  ];

  const popularSports = [
    {
      name: 'NFL Props',
      description: 'Quarterback passing yards, rushing touchdowns, receptions',
      icon: Football,
      color: 'text-orange-500',
      league: 'NFL'
    },
    {
      name: 'NBA Props',
      description: 'Points, assists, rebounds, three-pointers made',
      icon: Basketball,
      color: 'text-blue-500',
      league: 'NBA'
    },
    {
      name: 'NHL Props',
      description: 'Goals, saves, power play goals, penalty minutes',
      icon: Hockey,
      color: 'text-red-500',
      league: 'NHL'
    }
  ];

  const handleSportClick = (league: string) => {
    navigate('/games', { state: { selectedLeague: league } });
    toast.success(`Showing ${league} games and props!`);
  };

  return (
    <div className="h-full overflow-y-auto seamless-scroll bg-background">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-foreground">
                Bet Builder Hub
              </h1>
            </div>
            <p className="text-muted-foreground">
              Create advanced bets with player props, parlays, and specialized markets
            </p>
            {betSlip.bets.length > 0 && (
              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-accent/20 text-accent">
                      {betSlip.bets.length} selections
                    </Badge>
                    <span className="text-sm text-foreground">in your bet slip</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setMobilePanel('betslip')}
                    className="h-7"
                  >
                    View Slip
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bet Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {betTypes.map((betType, index) => (
              <motion.div
                key={betType.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
                  {betType.comingSoon && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                        Soon
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-3 rounded-xl ${betType.color} bg-opacity-20 ring-1 ring-white/10`}>
                        <betType.icon 
                          size={24} 
                          className={`${betType.color.replace('bg-', 'text-')}`} 
                        />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold mb-2">
                      {betType.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {betType.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button 
                      onClick={betType.action}
                      disabled={betType.comingSoon}
                      className={`w-full ${betType.comingSoon 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                      variant={betType.comingSoon ? "secondary" : "default"}
                    >
                      {betType.comingSoon ? 'Coming Soon' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Popular Sports Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendUp className="w-5 h-5 text-accent" />
              Popular Sports Props
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {popularSports.map((sport, index) => (
                <motion.div
                  key={sport.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSportClick(sport.league)}
                >
                  <Card className="cursor-pointer hover:border-accent/40 hover:shadow-md transition-all duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <sport.icon size={36} className={`mx-auto mb-4 ${sport.color}`} />
                      <h3 className="font-semibold text-foreground mb-2">{sport.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {sport.description}
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          Browse {sport.league}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 p-6 bg-secondary/30 rounded-xl border border-border/50"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              How to Build Advanced Bets
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sm font-semibold text-accent">1</span>
                </div>
                <h4 className="font-medium text-foreground mb-2">Browse Games</h4>
                <p className="text-sm text-muted-foreground">
                  Find games and expand them to see player props and detailed markets
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sm font-semibold text-accent">2</span>
                </div>
                <h4 className="font-medium text-foreground mb-2">Add Selections</h4>
                <p className="text-sm text-muted-foreground">
                  Click on odds to add them to your bet slip - mix game lines with props
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sm font-semibold text-accent">3</span>
                </div>
                <h4 className="font-medium text-foreground mb-2">Choose Bet Type</h4>
                <p className="text-sm text-muted-foreground">
                  Select single bets or combine into parlays for bigger payouts
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
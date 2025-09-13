import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Target, 
  TrendUp, 
  Trophy, 
  Timer,
  Basketball,
  Football,
  Hockey
} from '@phosphor-icons/react';

export const OtherPage = () => {
  const betTypes = [
    {
      id: 'prop-builder',
      title: 'Prop Builder',
      description: 'Create custom player and team props',
      icon: Target,
      color: 'bg-blue-500',
      comingSoon: false
    },
    {
      id: 'player-props',
      title: 'Player Props',
      description: 'Bet on individual player statistics',
      icon: User,
      color: 'bg-green-500',
      comingSoon: false
    },
    {
      id: 'live-betting',
      title: 'Live Betting',
      description: 'In-game betting with real-time odds',
      icon: Timer,
      color: 'bg-red-500',
      comingSoon: false
    },
    {
      id: 'parlays',
      title: 'Same Game Parlays',
      description: 'Combine multiple bets from one game',
      icon: TrendUp,
      color: 'bg-purple-500',
      comingSoon: false
    },
    {
      id: 'futures',
      title: 'Futures & Outright',
      description: 'Season-long championship odds',
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

  const handleBetTypeClick = (betTypeId: string) => {
    // For now, just show a toast or placeholder action
    console.log(`Selected bet type: ${betTypeId}`);
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
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Other Bet Types
            </h1>
            <p className="text-muted-foreground">
              Explore additional betting markets and prop builders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <Card className="h-full cursor-pointer hover:shadow-lg hover:border-accent/20 transition-all duration-300 relative overflow-hidden">
                  {betType.comingSoon && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                        Coming Soon
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${betType.color} bg-opacity-20`}>
                        <betType.icon 
                          size={24} 
                          className={`${betType.color.replace('bg-', 'text-')}`} 
                        />
                      </div>
                      <CardTitle className="text-lg font-semibold">
                        {betType.title}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {betType.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => handleBetTypeClick(betType.id)}
                      disabled={betType.comingSoon}
                      className={`w-full ${betType.comingSoon 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                      variant="outline"
                    >
                      {betType.comingSoon ? 'Coming Soon' : 'Explore'}
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
            className="mt-12"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Quick Access by Sport
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:border-accent/30 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Football size={32} className="mx-auto mb-3 text-orange-500" />
                    <h3 className="font-semibold text-foreground mb-2">NFL Props</h3>
                    <p className="text-sm text-muted-foreground">
                      Quarterback passing yards, rushing touchdowns, and more
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:border-accent/30 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Basketball size={32} className="mx-auto mb-3 text-blue-500" />
                    <h3 className="font-semibold text-foreground mb-2">NBA Props</h3>
                    <p className="text-sm text-muted-foreground">
                      Points, assists, rebounds, and player combinations
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:border-accent/30 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Hockey size={32} className="mx-auto mb-3 text-red-500" />
                    <h3 className="font-semibold text-foreground mb-2">NHL Props</h3>
                    <p className="text-sm text-muted-foreground">
                      Goals, saves, power play opportunities, and more
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
import { useNavigation } from '@/context/NavigationContext'
import { useBetSlip } from '@/context/BetSlipContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SmoothScrollContainer } from '@/components/VirtualScrolling'
import { User, TrendUp, Trophy, ChartBar, Calendar, CurrencyDollar } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'

// Mock data for trending games
const trendingGames = [
  {
    id: 1,
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeOdds: '-110',
    awayOdds: '+125',
    league: 'NBA',
    time: '8:00 PM EST',
    live: true,
    trending: true
  },
  {
    id: 2,
    homeTeam: 'Chiefs',
    awayTeam: 'Bills',
    homeOdds: '-150',
    awayOdds: '+130',
    league: 'NFL',
    time: '1:00 PM EST',
    live: false,
    trending: true
  },
  {
    id: 3,
    homeTeam: 'Dodgers',
    awayTeam: 'Yankees',
    homeOdds: '+115',
    awayOdds: '-135',
    league: 'MLB',
    time: '7:30 PM EST',
    live: true,
    trending: true
  },
  {
    id: 4,
    homeTeam: 'Avalanche',
    awayTeam: 'Lightning',
    homeOdds: '+140',
    awayOdds: '-160',
    league: 'NHL',
    time: '9:00 PM EST',
    live: false,
    trending: true
  }
]

export function HomePage() {
  const { navigation, selectSport } = useNavigation()
  const { betSlip } = useBetSlip()
  const navigate = useNavigate()
  const [activeBetsCount, setActiveBetsCount] = useState(0)

  useEffect(() => {
    setActiveBetsCount(betSlip.bets.length)
  }, [betSlip.bets])

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <SmoothScrollContainer className="flex-1" showScrollbar={false}>
        <div className="p-4 space-y-6">
          {/* Top Navigation Bar - Clean & Elegant */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex items-center space-x-2 border-accent/20 hover:border-accent/40 transition-all duration-300"
                >
                  <Link to="/my-bets">
                    <ChartBar size={16} />
                    <span>My Bets</span>
                    {activeBetsCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="bg-accent text-accent-foreground px-1.5 py-0.5 text-xs h-5"
                        >
                          {activeBetsCount}
                        </Badge>
                      </motion.div>
                    )}
                  </Link>
                </Button>
              </motion.div>
            </div>

            <div className="flex items-center">
              {/* Account navigation is handled by Header on desktop and mobile icon on mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-sm text-muted-foreground"
              >
                Welcome to NSS
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {[
              { icon: CurrencyDollar, label: 'Balance', value: '$1,250.00', color: 'text-accent' },
              { icon: Trophy, label: 'Win Rate', value: '68%', color: 'text-accent' },
              { icon: ChartBar, label: 'Active', value: activeBetsCount, color: 'text-primary' },
              { icon: Calendar, label: 'This Week', value: '+$340', color: 'text-accent' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <stat.icon size={20} className={stat.color} />
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trending Live Games Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendUp size={20} className="text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Trending Live Games</h2>
              </div>
              <Badge variant="outline" className="border-accent/30 text-accent">
                Live
              </Badge>
            </div>
            
            <div className="space-y-3">
              {trendingGames.map((game, index) => (
                <motion.button
                  key={game.id}
                  onClick={() => {
                    navigate('/games');
                  }}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-all duration-300 cursor-pointer text-left w-full"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {game.league}
                        </Badge>
                        {game.live && (
                          <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                            LIVE
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{game.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{game.awayTeam} @ {game.homeTeam}</p>
                        </div>
                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm" className="text-xs px-3" onClick={(e) => e.stopPropagation()}>
                            {game.awayOdds}
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs px-3" onClick={(e) => e.stopPropagation()}>
                            {game.homeOdds}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* View All Sports/Games Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center py-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                asChild
                size="lg"
                className="px-8 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                <Link to="/games" className="flex items-center space-x-2">
                  <Trophy size={20} />
                  <span>View All Sports & Games</span>
                </Link>
              </Button>
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">
              Explore all available betting markets and live games
            </p>
          </motion.div>

          {/* Featured Markets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">Featured Markets</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'NFL', games: '12 Games Today', sportId: 'football', icon: Trophy },
                { name: 'NBA', games: '8 Games Tonight', sportId: 'basketball', icon: ChartBar },
                { name: 'MLB', games: '6 Games Today', sportId: 'baseball', icon: TrendUp },
                { name: 'NHL', games: '4 Games Tonight', sportId: 'hockey', icon: Calendar }
              ].map((market, index) => (
                <motion.button
                  key={market.name}
                  onClick={() => {
                    selectSport(market.sportId);
                    navigate('/games');
                  }}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-all duration-300 cursor-pointer text-center w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex justify-center mb-2">
                    <market.icon size={24} className="text-accent" />
                  </div>
                  <div className="text-lg font-semibold text-foreground">{market.name}</div>
                  <div className="text-sm text-muted-foreground">{market.games}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Bottom spacing for smooth scroll */}
          <div className="h-16" />
        </div>
      </SmoothScrollContainer>
    </div>
  )
}
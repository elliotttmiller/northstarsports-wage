import { useNavigation } from '@/context/NavigationContext'
import { useBetSlip } from '@/context/BetSlipContext'
import { Card, CardContent } from '@/components/ui/card'
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
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to NSSPORTSCLUB</h1>
            <p className="text-muted-foreground">Your professional sports betting platform</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {[
              { icon: CurrencyDollar, label: 'Balance', value: '$1,250.00', color: 'text-accent' },
              { icon: Trophy, label: 'Win Rate', value: '68%', color: 'text-accent' },
              { icon: ChartBar, label: 'Active', value: activeBetsCount, color: 'text-primary' },
              { icon: Calendar, label: 'This Week', value: '+$340', color: 'text-accent' }
            ].map((stat, index) => (
              <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <stat.icon size={20} className={stat.color} />
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="font-semibold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* My Bets Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full mb-4"
            >
              <Link to="/my-bets" className="flex items-center space-x-2">
                <ChartBar size={20} />
                <span>My Bets</span>
                {activeBetsCount > 0 && (
                  <Badge variant="secondary">
                    {activeBetsCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </motion.div>

          {/* Trending Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <TrendUp size={20} className="text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Trending Live Games</h2>
            </div>
            
            <div className="space-y-3">
              {trendingGames.map((game) => (
                <Card key={game.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all cursor-pointer">
                  <CardContent className="p-4">
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
                        <p className="text-sm font-medium">{game.awayTeam} @ {game.homeTeam}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* View All Games Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <Button
              asChild
              size="lg"
              className="px-8 py-3"
            >
              <Link to="/games" className="flex items-center space-x-2">
                <Trophy size={20} />
                <span>View All Sports & Games</span>
              </Link>
            </Button>
          </motion.div>

          {/* Bottom spacing */}
          <div className="h-16" />
        </div>
      </SmoothScrollContainer>
    </div>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { SmoothScrollContainer } from '@/components/VirtualScrolling'

export function MyBetsPage() {
  const activeBets = [
    {
      id: 1,
      description: 'Chiefs -3.5',
      details: 'NFL • Sunday 1:00 PM',
      stake: '$25.00',
      odds: '-110'
    },
    {
      id: 2,
      description: 'Lakers ML',
      details: 'NBA • Tonight 8:00 PM',
      stake: '$50.00',
      odds: '+120'
    }
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <motion.div 
        className="p-4 border-b border-border bg-card flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-card-foreground">My Bets</h2>
        <p className="text-sm text-muted-foreground">Track your betting activity and results</p>
      </motion.div>

      <SmoothScrollContainer className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Bets</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Bets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activeBets.map((bet, index) => (
                        <motion.div
                          key={bet.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                          whileHover={{ x: 2, scale: 1.01 }}
                        >
                          <div>
                            <div className="font-medium">{bet.description}</div>
                            <div className="text-sm text-muted-foreground">{bet.details}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{bet.stake}</div>
                            <Badge variant="outline" className="text-xs">{bet.odds}</Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Betting History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="text-muted-foreground text-center py-8"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p>No betting history available yet. Place some bets to see your history here.</p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Total Wagered', value: '$0.00' },
                  { title: 'Win Rate', value: '0%' },
                  { title: 'Net Profit', value: '$0.00' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.2 + index * 0.1,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{stat.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </SmoothScrollContainer>
    </div>
  )
}
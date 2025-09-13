import { useNavigation } from '@/context/NavigationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function HomePage() {
  const { navigation } = useNavigation()

  return (
    <motion.div 
      className="h-full overflow-y-auto bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-border bg-card">
        <h2 className="text-xl font-bold text-card-foreground">NorthStar Sports</h2>
        <p className="text-sm text-muted-foreground">Professional Wagering Studio</p>
      </div>

      <div className="p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Professional sports betting platform with real-time odds and comprehensive analytics.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link to="/games">View All Games</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Featured Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                  <div className="text-lg font-semibold">NFL</div>
                  <div className="text-sm text-muted-foreground">12 Games Today</div>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                  <div className="text-lg font-semibold">NBA</div>
                  <div className="text-sm text-muted-foreground">8 Games Today</div>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                  <div className="text-lg font-semibold">MLB</div>
                  <div className="text-sm text-muted-foreground">6 Games Today</div>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                  <div className="text-lg font-semibold">NHL</div>
                  <div className="text-sm text-muted-foreground">4 Games Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link to="/my-bets">View My Bets</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/account">Account Settings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
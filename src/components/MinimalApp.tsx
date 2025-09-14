import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from '@phosphor-icons/react'

export function MinimalApp() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center space-x-2">
            <Trophy size={24} weight="fill" className="text-accent" />
            <h1 className="text-2xl font-bold">NSSPORTSCLUB</h1>
          </div>
        </header>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,250.00</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button className="bg-accent hover:bg-accent/90">
            View Games
          </Button>
          <Button variant="outline">
            My Bets
          </Button>
          <Button variant="outline">
            Account
          </Button>
        </div>

        {/* Status Message */}
        <div className="mt-8 text-center text-muted-foreground">
          <p>Welcome to NSSPORTSCLUB - Your Professional Sports Betting Platform</p>
          <p className="text-sm mt-2">Application restored to working state</p>
        </div>
      </div>
    </div>
  )
}
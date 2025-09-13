import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MyBetsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="p-4 border-b border-border bg-card flex-shrink-0">
        <h2 className="text-xl font-bold text-card-foreground">My Bets</h2>
        <p className="text-sm text-muted-foreground">Track your betting activity and results</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Bets</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Bets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Chiefs -3.5</div>
                      <div className="text-sm text-muted-foreground">NFL • Sunday 1:00 PM</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$25.00</div>
                      <Badge variant="outline" className="text-xs">-110</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Lakers ML</div>
                      <div className="text-sm text-muted-foreground">NBA • Tonight 8:00 PM</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$50.00</div>
                      <Badge variant="outline" className="text-xs">+120</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Betting History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No betting history available yet. Place some bets to see your history here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Wagered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
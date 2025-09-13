import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GameCardProps {
  game: {
    id: string
    homeTeam: string
    awayTeam: string
    gameTime: string
    homeOdds?: number
    awayOdds?: number
  }
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{game.awayTeam} @ {game.homeTeam}</span>
          <span className="text-sm text-muted-foreground">{game.gameTime}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {game.awayOdds && (
            <Button variant="outline" className="flex-1">
              {game.awayTeam} {game.awayOdds > 0 ? '+' : ''}{game.awayOdds}
            </Button>
          )}
          {game.homeOdds && (
            <Button variant="outline" className="flex-1">
              {game.homeTeam} {game.homeOdds > 0 ? '+' : ''}{game.homeOdds}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
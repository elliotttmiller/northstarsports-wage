import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X } from '@phosphor-icons/react'

interface BetSlipItemProps {
  bet: {
    id: string
    team: string
    odds: number
    stake: number
    potentialPayout: number
  }
  onRemove: () => void
}

export function BetSlipItem({ bet, onRemove }: BetSlipItemProps) {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium">{bet.team}</span>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X size={16} />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <div>Odds: {bet.odds > 0 ? '+' : ''}{bet.odds}</div>
          <div>Stake: ${bet.stake}</div>
          <div>To Win: ${bet.potentialPayout.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  )
}
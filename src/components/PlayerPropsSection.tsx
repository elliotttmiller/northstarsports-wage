import { PlayerPropsContainer } from '@/components/player-props/PlayerPropsContainer'
import { PropCategory } from '@/types'
import { Game } from '@/types'

interface PlayerPropsSectionProps {
  categories: PropCategory[]
  game: Game
  isLoading: boolean
  compact?: boolean
}

export function PlayerPropsSection({ categories, game, isLoading, compact = false }: PlayerPropsSectionProps) {
  return (
    <PlayerPropsContainer
      categories={categories}
      game={game}
      isLoading={isLoading}
      compact={compact}
    />
  )
}
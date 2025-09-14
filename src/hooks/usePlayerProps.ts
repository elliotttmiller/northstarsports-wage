import { useMemo } from 'react'
import { useBetSlip } from '@/context/BetSlipContext'
import type { PlayerProp, PropCategory } from '@/services/mockApi'

/**
 * Hook to manage player prop interactions and state
 */
export function usePlayerProps(categories: PropCategory[]) {
  const { betSlip } = useBetSlip()

  // Calculate prop statistics
  const stats = useMemo(() => {
    const totalProps = categories.reduce((sum, cat) => sum + cat.props.length, 0)
    const popularCategory = categories.find(cat => cat.key === 'popular')
    const mostPropsCategory = categories.reduce((max, cat) => 
      cat.props.length > (max?.props.length || 0) ? cat : max
    )

    return {
      totalProps,
      totalCategories: categories.length,
      popularProps: popularCategory?.props.length || 0,
      mostActiveCategory: mostPropsCategory?.name || 'None'
    }
  }, [categories])

  // Get selected props from bet slip
  const getSelectedProps = useMemo(() => {
    return betSlip.bets
      .filter(bet => bet.betType === 'player_prop')
      .map(bet => ({
        playerId: bet.playerProp?.playerId,
        selection: bet.selection,
        odds: bet.odds,
        line: bet.line
      }))
  }, [betSlip.bets])

  // Check if a specific prop is selected
  const isPropSelected = (prop: PlayerProp, selection: 'over' | 'under'): boolean => {
    return betSlip.bets.some(bet =>
      bet.betType === 'player_prop' &&
      bet.playerProp?.playerId === prop.playerId &&
      bet.selection === selection
    )
  }

  // Get prop selection count for a player
  const getPlayerSelectionCount = (playerId: string): number => {
    return betSlip.bets.filter(bet =>
      bet.betType === 'player_prop' &&
      bet.playerProp?.playerId === playerId
    ).length
  }

  // Sort categories by various criteria
  const sortCategories = (sortBy: 'default' | 'alphabetical' | 'mostProps' | 'popular'): PropCategory[] => {
    switch (sortBy) {
      case 'alphabetical':
        return [...categories].sort((a, b) => a.name.localeCompare(b.name))
      case 'mostProps':
        return [...categories].sort((a, b) => b.props.length - a.props.length)
      case 'popular':
        return [...categories].sort((a, b) => {
          if (a.key === 'popular') return -1
          if (b.key === 'popular') return 1
          return 0
        })
      default:
        return categories
    }
  }

  // Filter props by search term
  const filterProps = (searchTerm: string): PropCategory[] => {
    if (!searchTerm) return categories

    return categories.map(category => ({
      ...category,
      props: category.props.filter(prop =>
        prop.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.statType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.position.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.props.length > 0)
  }

  return {
    stats,
    getSelectedProps,
    isPropSelected,
    getPlayerSelectionCount,
    sortCategories,
    filterProps
  }
}
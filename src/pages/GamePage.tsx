import { useParams } from 'react-router-dom'
import { WorkspacePanel } from '@/components/panels/WorkspacePanel'

export function GamePage() {
  const { gameId } = useParams()
  
  // If viewing a specific game, we could customize the WorkspacePanel
  // For now, we'll show the standard workspace
  return <WorkspacePanel />
}
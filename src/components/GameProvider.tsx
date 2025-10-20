import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useGameState } from '../hooks/useGameState'
import type { UseGameStateReturn } from '../hooks/useGameState'

const GameContext = createContext<UseGameStateReturn | null>(null)

/**
 * GameProvider - Context provider for game state
 * Follows Dependency Inversion Principle - components depend on context, not direct state
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const gameState = useGameState()

  return <GameContext.Provider value={gameState}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === null) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

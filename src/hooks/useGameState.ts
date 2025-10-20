import { useReducer, useCallback } from 'react'
import type { GameState } from '../domain/types'
import { gameReducer, createInitialHistory } from './gameReducer'

export interface UseGameStateReturn {
  gameState: GameState
  placeMove: (position: number) => void
  undo: () => void
  redo: () => void
  reset: () => void
  canUndo: boolean
  canRedo: boolean
}

export function useGameState(): UseGameStateReturn {
  const [history, dispatch] = useReducer(gameReducer, createInitialHistory())

  const placeMove = useCallback((position: number) => {
    dispatch({ type: 'PLACE_MOVE', position })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    gameState: history.present,
    placeMove,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}

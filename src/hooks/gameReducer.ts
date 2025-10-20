import type { GameState } from '../domain/types'
import { createInitialGameState, placeMove } from '../domain/gameLogic'

export type GameAction =
  | { type: 'PLACE_MOVE'; position: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }

export interface GameHistory {
  past: GameState[]
  present: GameState
  future: GameState[]
}

export function createInitialHistory(): GameHistory {
  return {
    past: [],
    present: createInitialGameState(),
    future: [],
  }
}

export function gameReducer(history: GameHistory, action: GameAction): GameHistory {
  switch (action.type) {
    case 'PLACE_MOVE': {
      const newState = placeMove(history.present, action.position)

      // If move is invalid, return unchanged history
      if (newState === null) {
        return history
      }

      // Add current state to past, clear future
      return {
        past: [...history.past, history.present],
        present: newState,
        future: [],
      }
    }

    case 'UNDO': {
      if (history.past.length === 0) {
        return history
      }

      const previous = history.past[history.past.length - 1]
      const newPast = history.past.slice(0, -1)

      return {
        past: newPast,
        present: previous,
        future: [history.present, ...history.future],
      }
    }

    case 'REDO': {
      if (history.future.length === 0) {
        return history
      }

      const next = history.future[0]
      const newFuture = history.future.slice(1)

      return {
        past: [...history.past, history.present],
        present: next,
        future: newFuture,
      }
    }

    case 'RESET': {
      return createInitialHistory()
    }

    default:
      return history
  }
}

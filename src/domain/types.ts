export enum Player {
  X = 'X',
  O = 'O',
}

export enum CellState {
  Empty = 'Empty',
  X = 'X',
  O = 'O',
}

export enum GameStatus {
  Ongoing = 'Ongoing',
  XWins = 'XWins',
  OWins = 'OWins',
  Draw = 'Draw',
}

export type Board = CellState[]

export interface GameState {
  board: Board
  currentPlayer: Player
  status: GameStatus
  winningPattern: number[] | null
}

export const BOARD_SIZE = 3
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE

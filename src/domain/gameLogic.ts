import type { Board, GameState } from './types'
import { CellState, GameStatus, Player, TOTAL_CELLS } from './types'

// Winning patterns: rows, columns, diagonals
const WINNING_PATTERNS = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
]

export function createEmptyBoard(): Board {
  return Array(TOTAL_CELLS).fill(CellState.Empty)
}

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: Player.X,
    status: GameStatus.Ongoing,
  }
}

export function playerToCellState(player: Player): CellState {
  return player === Player.X ? CellState.X : CellState.O
}

export function cellStateToPlayer(cellState: CellState): Player | null {
  if (cellState === CellState.X) return Player.X
  if (cellState === CellState.O) return Player.O
  return null
}

export function togglePlayer(player: Player): Player {
  return player === Player.X ? Player.O : Player.X
}

export function checkWinner(board: Board): CellState.X | CellState.O | null {
  for (const pattern of WINNING_PATTERNS) {
    const [a, b, c] = pattern
    if (
      board[a] !== CellState.Empty &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a] as CellState.X | CellState.O
    }
  }
  return null
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== CellState.Empty)
}

export function updateGameStatus(board: Board): GameStatus {
  const winner = checkWinner(board)

  if (winner === CellState.X) {
    return GameStatus.XWins
  }

  if (winner === CellState.O) {
    return GameStatus.OWins
  }

  if (isBoardFull(board)) {
    return GameStatus.Draw
  }

  return GameStatus.Ongoing
}

export function isValidMove(board: Board, position: number): boolean {
  return position >= 0 && position < TOTAL_CELLS && board[position] === CellState.Empty
}

export function placeMove(state: GameState, position: number): GameState | null {
  // Validate move
  if (state.status !== GameStatus.Ongoing) {
    return null
  }

  if (!isValidMove(state.board, position)) {
    return null
  }

  // Create new board with move applied
  const newBoard = [...state.board]
  newBoard[position] = playerToCellState(state.currentPlayer)

  // Update game status
  const newStatus = updateGameStatus(newBoard)

  // Toggle player only if game is still ongoing
  const newPlayer = newStatus === GameStatus.Ongoing
    ? togglePlayer(state.currentPlayer)
    : state.currentPlayer

  return {
    board: newBoard,
    currentPlayer: newPlayer,
    status: newStatus,
  }
}

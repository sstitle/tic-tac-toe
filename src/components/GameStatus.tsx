import { GameStatus as Status } from '../domain/types'
import { useGame } from './GameProvider'

export function GameStatus() {
  const { gameState } = useGame()

  const getStatusMessage = () => {
    switch (gameState.status) {
      case Status.XWins:
        return 'X Wins!'
      case Status.OWins:
        return 'O Wins!'
      case Status.Draw:
        return "It's a Draw!"
      case Status.Ongoing:
        return `Current Player: ${gameState.currentPlayer}`
    }
  }

  const isGameOver = gameState.status !== Status.Ongoing

  return (
    <div
      style={{
        fontSize: '20px',
        fontWeight: 'bold' as const,
        marginBottom: '15px',
        color: isGameOver ? '#ffd700' : '#fff',
        textShadow: isGameOver ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
      }}
    >
      {getStatusMessage()}
    </div>
  )
}

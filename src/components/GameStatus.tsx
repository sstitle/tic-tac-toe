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
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: isGameOver ? '#646cff' : '#fff',
      }}
    >
      {getStatusMessage()}
    </div>
  )
}

import { CellState, BOARD_SIZE } from '../domain/types'
import { useGame } from './GameProvider'

export function ButtonBoard() {
  const { gameState, placeMove } = useGame()

  const getCellContent = (cellState: CellState) => {
    if (cellState === CellState.X) return 'X'
    if (cellState === CellState.O) return 'O'
    return ''
  }

  const getCellColor = (cellState: CellState) => {
    if (cellState === CellState.X) return '#ff0000'
    if (cellState === CellState.O) return '#0000ff'
    return '#fff'
  }

  const cellStyle = (cellState: CellState) => ({
    width: '100px',
    height: '100px',
    fontSize: '48px',
    fontWeight: 'bold',
    border: '2px solid #646cff',
    backgroundColor: '#1a1a1a',
    color: getCellColor(cellState),
    cursor: cellState === CellState.Empty ? 'pointer' : 'default',
    transition: 'all 0.2s',
  })

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 100px)`,
    gap: '5px',
    justifyContent: 'center',
    margin: '0 auto',
    width: 'fit-content',
  }

  return (
    <div style={gridStyle}>
      {gameState.board.map((cellState, index) => (
        <button
          key={index}
          onClick={() => placeMove(index)}
          style={cellStyle(cellState)}
          disabled={cellState !== CellState.Empty}
        >
          {getCellContent(cellState)}
        </button>
      ))}
    </div>
  )
}

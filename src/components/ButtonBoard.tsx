import { useState } from 'react'
import { CellState, BOARD_SIZE } from '../domain/types'
import { useGame } from './GameProvider'

export function ButtonBoard() {
  const { gameState, placeMove } = useGame()
  const [hoverCell, setHoverCell] = useState<number | null>(null)

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

  const cellStyle = (cellState: CellState, index: number) => ({
    width: '100px',
    height: '100px',
    fontSize: '48px',
    fontWeight: 'bold' as const,
    border: '2px solid #444',
    backgroundColor: hoverCell === index && cellState === CellState.Empty
      ? 'rgba(255, 255, 0, 0.3)'
      : '#2a2a2a',
    color: getCellColor(cellState),
    cursor: cellState === CellState.Empty ? 'pointer' : 'default',
    transition: 'all 0.2s',
    borderRadius: '8px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 100px)`,
    gap: '10px',
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
          onMouseEnter={() => setHoverCell(index)}
          onMouseLeave={() => setHoverCell(null)}
          style={cellStyle(cellState, index)}
          disabled={cellState !== CellState.Empty}
        >
          {getCellContent(cellState)}
        </button>
      ))}
    </div>
  )
}

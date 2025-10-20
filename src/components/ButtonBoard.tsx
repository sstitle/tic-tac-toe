import { useState, useCallback, useMemo } from 'react'
import { CellState, BOARD_SIZE } from '../domain/types'
import { useGame } from './GameProvider'
import { BUTTON_BOARD_CONFIG } from '../config/boardStyles'

/**
 * ButtonBoard - Traditional button-based game board
 * Refactored to follow React best practices with useCallback and useMemo
 */
export function ButtonBoard() {
  const { gameState, placeMove } = useGame()
  const [hoverCell, setHoverCell] = useState<number | null>(null)

  // Memoized helper functions
  const getCellContent = useCallback((cellState: CellState): string => {
    if (cellState === CellState.X) return 'X'
    if (cellState === CellState.O) return 'O'
    return ''
  }, [])

  const getCellColor = useCallback((cellState: CellState): string => {
    const { colors } = BUTTON_BOARD_CONFIG
    if (cellState === CellState.X) return colors.x
    if (cellState === CellState.O) return colors.o
    return colors.empty
  }, [])

  // Memoized cell style function
  const getCellStyle = useCallback(
    (cellState: CellState, index: number) => {
      const { cell, colors } = BUTTON_BOARD_CONFIG
      return {
        width: `${cell.width}px`,
        height: `${cell.height}px`,
        fontSize: `${cell.fontSize}px`,
        fontWeight: 'bold' as const,
        border: `2px solid ${colors.border}`,
        backgroundColor:
          hoverCell === index && cellState === CellState.Empty ? colors.hover : colors.background,
        color: getCellColor(cellState),
        cursor: cellState === CellState.Empty ? 'pointer' : 'default',
        transition: 'all 0.2s',
        borderRadius: `${cell.borderRadius}px`,
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    },
    [hoverCell, getCellColor]
  )

  // Memoized grid style
  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${BOARD_SIZE}, ${BUTTON_BOARD_CONFIG.cell.width}px)`,
      gap: `${BUTTON_BOARD_CONFIG.grid.gap}px`,
      justifyContent: 'center',
      margin: '0 auto',
      width: 'fit-content',
    }),
    []
  )

  // Memoized event handlers
  const handleCellClick = useCallback(
    (index: number) => {
      placeMove(index)
    },
    [placeMove]
  )

  const handleMouseEnter = useCallback((index: number) => {
    setHoverCell(index)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoverCell(null)
  }, [])

  return (
    <div style={gridStyle}>
      {gameState.board.map((cellState, index) => (
        <button
          key={index}
          onClick={() => handleCellClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          style={getCellStyle(cellState, index)}
          disabled={cellState !== CellState.Empty}
        >
          {getCellContent(cellState)}
        </button>
      ))}
    </div>
  )
}

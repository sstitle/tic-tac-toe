import { useEffect, useRef } from 'react'
import { CellState, BOARD_SIZE } from '../domain/types'
import { useGame } from './GameProvider'

const CANVAS_SIZE = 600
const CELL_SIZE = CANVAS_SIZE / BOARD_SIZE
const LINE_WIDTH = 4
const SYMBOL_PADDING = 30

export function Canvas2DBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { gameState, placeMove } = useGame()

  // Draw the board
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw grid lines
    ctx.strokeStyle = '#646cff'
    ctx.lineWidth = LINE_WIDTH

    for (let i = 1; i < BOARD_SIZE; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw X's and O's
    gameState.board.forEach((cellState, index) => {
      const row = Math.floor(index / BOARD_SIZE)
      const col = index % BOARD_SIZE
      const x = col * CELL_SIZE
      const y = row * CELL_SIZE
      const centerX = x + CELL_SIZE / 2
      const centerY = y + CELL_SIZE / 2

      if (cellState === CellState.X) {
        // Draw X in red
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 8
        ctx.lineCap = 'round'

        ctx.beginPath()
        ctx.moveTo(x + SYMBOL_PADDING, y + SYMBOL_PADDING)
        ctx.lineTo(x + CELL_SIZE - SYMBOL_PADDING, y + CELL_SIZE - SYMBOL_PADDING)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x + CELL_SIZE - SYMBOL_PADDING, y + SYMBOL_PADDING)
        ctx.lineTo(x + SYMBOL_PADDING, y + CELL_SIZE - SYMBOL_PADDING)
        ctx.stroke()
      } else if (cellState === CellState.O) {
        // Draw O in blue
        ctx.strokeStyle = '#0000ff'
        ctx.lineWidth = 8
        ctx.lineCap = 'round'

        ctx.beginPath()
        ctx.arc(centerX, centerY, CELL_SIZE / 2 - SYMBOL_PADDING, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }, [gameState.board])

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const col = Math.floor(x / CELL_SIZE)
    const row = Math.floor(y / CELL_SIZE)
    const position = row * BOARD_SIZE + col

    placeMove(position)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleClick}
        style={{
          border: '2px solid #646cff',
          borderRadius: '8px',
          cursor: 'pointer',
          backgroundColor: '#1a1a1a',
        }}
      />
    </div>
  )
}

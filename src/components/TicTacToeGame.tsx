import { useState } from 'react'
import { GameProvider } from './GameProvider'
import { GameStatus } from './GameStatus'
import { GameControls } from './GameControls'
import { ButtonBoard } from './ButtonBoard'
import { Canvas2DBoard } from './Canvas2DBoard'
import { ThreeJSBoard } from './ThreeJSBoard'

type ViewMode = 'buttons' | 'canvas2d' | 'threejs'

interface TicTacToeGameProps {
  onBack: () => void
}

export function TicTacToeGame({ onBack }: TicTacToeGameProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('buttons')

  const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    margin: '0 5px',
    fontSize: '16px',
    borderRadius: '8px 8px 0 0',
    border: '1px solid #444',
    borderBottom: active ? 'none' : '1px solid #444',
    backgroundColor: active ? '#2a2a2a' : '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: active ? ('bold' as const) : ('normal' as const),
  })

  const backButtonStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
  }

  return (
    <GameProvider>
      <div style={{ padding: '10px', margin: '0 auto', maxWidth: '900px', position: 'relative' }}>
        <button onClick={onBack} style={backButtonStyle}>
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#fff' }}>Tic-Tac-Toe</h1>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
            <GameStatus />
            <GameControls />
          </div>
        </div>

        <div style={{ marginBottom: '10px', textAlign: 'center' }}>
          <button
            onClick={() => setViewMode('buttons')}
            style={tabStyle(viewMode === 'buttons')}
          >
            Button Grid
          </button>
          <button
            onClick={() => setViewMode('canvas2d')}
            style={tabStyle(viewMode === 'canvas2d')}
          >
            2D Canvas
          </button>
          <button
            onClick={() => setViewMode('threejs')}
            style={tabStyle(viewMode === 'threejs')}
          >
            3D WebGL
          </button>
        </div>

        <div style={{
          border: '1px solid #444',
          borderRadius: '0 8px 8px 8px',
          padding: '15px',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {viewMode === 'buttons' && <ButtonBoard />}
          {viewMode === 'canvas2d' && <Canvas2DBoard />}
          {viewMode === 'threejs' && <ThreeJSBoard />}
        </div>
      </div>
    </GameProvider>
  )
}

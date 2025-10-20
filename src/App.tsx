import { useState } from 'react'
import './App.css'
import { GameProvider } from './components/GameProvider'
import { GameStatus } from './components/GameStatus'
import { GameControls } from './components/GameControls'
import { ButtonBoard } from './components/ButtonBoard'
import { Canvas2DBoard } from './components/Canvas2DBoard'
import { ThreeJSBoard } from './components/ThreeJSBoard'

type ViewMode = 'buttons' | 'canvas2d' | 'threejs'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('buttons')

  const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    margin: '0 5px',
    fontSize: '16px',
    borderRadius: '4px 4px 0 0',
    border: '1px solid #646cff',
    borderBottom: active ? 'none' : '1px solid #646cff',
    backgroundColor: active ? '#1a1a1a' : '#0a0a0a',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
  })

  return (
    <GameProvider>
      <div style={{ margin: '20px auto', maxWidth: '800px', textAlign: 'center', minHeight: '100vh' }}>
        <h1 style={{ marginBottom: '30px', color: '#fff' }}>Tic-Tac-Toe</h1>

        <GameStatus />
        <GameControls />

        <div style={{ marginBottom: '20px' }}>
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
          border: '1px solid #646cff',
          borderRadius: '0 8px 8px 8px',
          padding: '20px',
          backgroundColor: '#0a0a0a',
        }}>
          {viewMode === 'buttons' && <ButtonBoard />}
          {viewMode === 'canvas2d' && <Canvas2DBoard />}
          {viewMode === 'threejs' && <ThreeJSBoard />}
        </div>
      </div>
    </GameProvider>
  )
}

export default App

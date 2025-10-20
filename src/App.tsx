import { useState } from 'react'
import './App.css'
import { Home } from './components/Home'
import { TicTacToeGame } from './components/TicTacToeGame'
import ThreeScene from './ThreeScene'

type View = 'home' | '3d-example' | 'tic-tac-toe'

function App() {
  const [currentView, setCurrentView] = useState<View>('home')

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

  if (currentView === 'home') {
    return <Home onNavigate={setCurrentView} />
  }

  if (currentView === '3d-example') {
    return (
      <div style={{ padding: '10px', margin: '0 auto', maxWidth: '900px', position: 'relative' }}>
        <button onClick={() => setCurrentView('home')} style={backButtonStyle}>
          ← Back
        </button>
        <div style={{ paddingTop: '10px' }}>
          <ThreeScene />
        </div>
      </div>
    )
  }

  if (currentView === 'tic-tac-toe') {
    return <TicTacToeGame onBack={() => setCurrentView('home')} />
  }

  return null
}

export default App

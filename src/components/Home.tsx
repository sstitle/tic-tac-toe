interface HomeProps {
  onNavigate: (view: '3d-example' | 'tic-tac-toe' | 'perlin-noise') => void
}

export function Home({ onNavigate }: HomeProps) {
  const buttonStyle = {
    padding: '20px 40px',
    margin: '20px',
    fontSize: '24px',
    borderRadius: '8px',
    border: '2px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '250px',
    fontWeight: 'bold' as const,
  }

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '15px',
    padding: '20px',
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '36px', marginBottom: '20px', color: '#fff' }}>
        Welcome
      </h1>
      <button
        onClick={() => onNavigate('3d-example')}
        style={buttonStyle}
      >
        3D Example
      </button>
      <button
        onClick={() => onNavigate('tic-tac-toe')}
        style={buttonStyle}
      >
        Tic Tac Toe
      </button>
      <button
        onClick={() => onNavigate('perlin-noise')}
        style={buttonStyle}
      >
        Perlin Noise Shader
      </button>
    </div>
  )
}

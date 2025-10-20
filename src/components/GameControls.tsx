import { useGame } from './GameProvider'

export function GameControls() {
  const { undo, redo, reset, canUndo, canRedo } = useGame()

  const buttonStyle = (disabled: boolean) => ({
    padding: '10px 20px',
    margin: '0 5px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #646cff',
    backgroundColor: disabled ? '#333' : '#1a1a1a',
    color: disabled ? '#666' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  })

  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={undo} disabled={!canUndo} style={buttonStyle(!canUndo)}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo} style={buttonStyle(!canRedo)}>
        Redo
      </button>
      <button onClick={reset} style={buttonStyle(false)}>
        Reset
      </button>
    </div>
  )
}

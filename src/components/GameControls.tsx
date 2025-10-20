import { useCallback, useMemo } from 'react'
import { useGame } from './GameProvider'
import { CONTROL_BUTTON_CONFIG } from '../config/boardStyles'

/**
 * GameControls - Control buttons for undo/redo/reset
 * Refactored to follow React best practices with useCallback and configuration-driven styling
 */
export function GameControls() {
  const { undo, redo, reset, canUndo, canRedo } = useGame()

  // Memoized button style generator
  const getButtonStyle = useCallback((disabled: boolean) => {
    const { padding, margin, fontSize, borderRadius, colors, opacity } = CONTROL_BUTTON_CONFIG
    return {
      padding,
      margin,
      fontSize,
      borderRadius,
      border: `1px solid ${colors.border}`,
      backgroundColor: disabled ? colors.backgroundDisabled : colors.background,
      color: disabled ? colors.textDisabled : colors.text,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? opacity.disabled : opacity.enabled,
      transition: 'all 0.2s',
    }
  }, [])

  // Memoized button styles
  const undoButtonStyle = useMemo(() => getButtonStyle(!canUndo), [getButtonStyle, canUndo])
  const redoButtonStyle = useMemo(() => getButtonStyle(!canRedo), [getButtonStyle, canRedo])
  const resetButtonStyle = useMemo(() => getButtonStyle(false), [getButtonStyle])

  return (
    <div style={{ display: 'flex', gap: '4px', whiteSpace: 'nowrap' }}>
      <button onClick={undo} disabled={!canUndo} style={undoButtonStyle}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo} style={redoButtonStyle}>
        Redo
      </button>
      <button onClick={reset} style={resetButtonStyle}>
        Reset
      </button>
    </div>
  )
}

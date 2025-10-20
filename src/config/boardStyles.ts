/**
 * Styling configuration for board components
 * Following Open/Closed Principle - easy to modify styles without changing logic
 */

export const BUTTON_BOARD_CONFIG = {
  cell: {
    width: 100,
    height: 100,
    fontSize: 48,
    borderRadius: 8,
  },
  grid: {
    gap: 10,
  },
  colors: {
    x: '#ff0000',
    o: '#0000ff',
    empty: '#fff',
    background: '#2a2a2a',
    hover: 'rgba(255, 255, 0, 0.3)',
    border: '#444',
  },
} as const

export const CONTROL_BUTTON_CONFIG = {
  padding: '8px 16px',
  margin: '0 4px',
  fontSize: '14px',
  borderRadius: '6px',
  colors: {
    background: '#2a2a2a',
    backgroundDisabled: '#1a1a1a',
    text: '#fff',
    textDisabled: '#666',
    border: '#444',
  },
  opacity: {
    enabled: 1,
    disabled: 0.5,
  },
} as const

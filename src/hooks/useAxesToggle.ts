import { useEffect, useState } from 'react'
import * as THREE from 'three'

/**
 * Custom hook for toggling axes visibility with keyboard
 * Follows Single Responsibility Principle - only manages axes toggle
 */
export function useAxesToggle(axesRef: React.RefObject<THREE.Group | null>) {
  const [showAxes, setShowAxes] = useState(false)

  // Update axes visibility
  useEffect(() => {
    if (axesRef.current) {
      axesRef.current.visible = showAxes
    }
  }, [showAxes, axesRef])

  // Keyboard listener for axes toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        setShowAxes((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return { showAxes, setShowAxes }
}

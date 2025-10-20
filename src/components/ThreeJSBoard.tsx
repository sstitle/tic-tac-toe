import { useCallback, useEffect, useRef } from 'react'
import { GameStatus } from '../domain/types'
import { useGame } from './GameProvider'
import { useThreeScene } from '../hooks/useThreeScene'
import { useBoardRenderer } from '../hooks/useBoardRenderer'
import { useWinningLine } from '../hooks/useWinningLine'
import { useGridInteraction } from '../hooks/useGridInteraction'
import { useAnimationLoop } from '../hooks/useAnimationLoop'
import { useAxesToggle } from '../hooks/useAxesToggle'

/**
 * ThreeJSBoard - 3D visualization of Tic Tac Toe game
 * Refactored to follow SOLID principles and React best practices
 *
 * Single Responsibility: Only coordinates hooks and handles user interactions
 * Open/Closed: Configuration-driven, easy to extend without modifying
 * Dependency Inversion: Depends on abstractions (hooks) not concrete implementations
 */
export function ThreeJSBoard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { gameState, placeMove } = useGame()

  // Hook 1: Initialize Three.js scene
  const { sceneRef, cameraRef, rendererRef, axesRef, hoverHighlightRef, sceneReady } =
    useThreeScene(containerRef)

  // Hook 2: Render game pieces
  const { meshesRef } = useBoardRenderer(sceneRef, gameState.board, sceneReady)

  // Hook 3: Render winning line
  useWinningLine(sceneRef, gameState.winningPattern, sceneReady)

  // Hook 4: Handle grid interaction
  const { createMouseMoveHandler, createMouseLeaveHandler, createClickHandler } =
    useGridInteraction()

  // Hook 5: Animation loop
  useAnimationLoop(rendererRef, sceneRef, cameraRef, meshesRef)

  // Hook 6: Axes toggle
  useAxesToggle(axesRef)

  // Memoized click handler with game-over prevention
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Prevent clicks when game is over
      if (gameState.status !== GameStatus.Ongoing) return

      const container = containerRef.current
      const camera = cameraRef.current

      if (!container || !camera) return

      const clickHandler = createClickHandler(container, camera, placeMove)
      clickHandler(event)
    },
    [gameState.status, createClickHandler, placeMove]
  )

  // Setup mouse event listeners
  useEffect(() => {
    const renderer = rendererRef.current
    const container = containerRef.current
    const camera = cameraRef.current
    const hoverHighlight = hoverHighlightRef.current

    if (!renderer || !container || !camera || !hoverHighlight) return

    const handleMouseMove = createMouseMoveHandler(container, camera, hoverHighlight)
    const handleMouseLeave = createMouseLeaveHandler(hoverHighlight)

    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [createMouseMoveHandler, createMouseLeaveHandler, rendererRef, hoverHighlightRef])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div
        ref={containerRef}
        onClick={handleClick}
        style={{
          width: '100%',
          maxWidth: 'min(90vw, 600px)',
          minWidth: '300px',
          aspectRatio: '1',
          border: '2px solid #646cff',
          borderRadius: '8px',
          cursor: gameState.status === GameStatus.Ongoing ? 'pointer' : 'default',
        }}
      />
    </div>
  )
}

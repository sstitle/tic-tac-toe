import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Board } from '../domain/types'
import { CellState, BOARD_SIZE } from '../domain/types'
import { PIECE_CONFIG } from '../config/threeConfig'
import { createGamePiece } from '../utils/threeFactories'
import { positionToCoordinates, disposeMesh } from '../utils/threeHelpers'
import { GRID_CONFIG } from '../config/threeConfig'

/**
 * Custom hook for rendering game pieces on the board
 * Follows Single Responsibility Principle - only manages piece rendering
 */
export function useBoardRenderer(
  sceneRef: React.RefObject<THREE.Scene | null>,
  board: Board,
  sceneReady: boolean
) {
  const meshesRef = useRef<Map<number, THREE.Group | THREE.Mesh>>(new Map())

  // Update board based on game state - preserve existing pieces to keep animations
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !sceneReady) return

    // Remove pieces that are no longer on the board
    meshesRef.current.forEach((mesh, position) => {
      if (board[position] === CellState.Empty) {
        scene.remove(mesh)
        disposeMesh(mesh)
        meshesRef.current.delete(position)
      }
    })

    // Add new pieces that weren't there before
    board.forEach((cellState, index) => {
      if (cellState === CellState.Empty || meshesRef.current.has(index)) return

      const mesh = createGamePiece(cellState)
      if (!mesh) return

      const { x, y } = positionToCoordinates(index, BOARD_SIZE, GRID_CONFIG.halfSize)
      const z = PIECE_CONFIG.height

      mesh.position.set(x, y, z)
      scene.add(mesh)
      meshesRef.current.set(index, mesh)
    })
  }, [board, sceneReady, sceneRef])

  return { meshesRef }
}

import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { BOARD_SIZE } from '../domain/types'
import { GRID_CONFIG, HOVER_CONFIG } from '../config/threeConfig'
import { getNormalizedMouseCoordinates } from '../utils/threeHelpers'

export interface GridCellInfo {
  row: number
  col: number
  position: number
  cellX: number
  cellY: number
}

/**
 * Custom hook for grid interaction (raycasting and mouse events)
 * Follows Single Responsibility Principle - only handles user interaction with grid
 */
export function useGridInteraction() {
  const raycasterRef = useRef(new THREE.Raycaster())

  /**
   * Calculates the grid cell position from mouse coordinates using raycasting
   * against the XY plane at z=0.
   * Memoized with useCallback to prevent recreation
   */
  const getGridCellFromMouse = useCallback(
    (mouseX: number, mouseY: number, camera: THREE.Camera): GridCellInfo | null => {
      // Intersect with XY plane at z=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
      const raycaster = raycasterRef.current
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera)

      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, intersection)

      // Check if intersection is within grid bounds
      if (
        intersection.x >= -GRID_CONFIG.halfSize &&
        intersection.x <= GRID_CONFIG.halfSize &&
        intersection.y >= -GRID_CONFIG.halfSize &&
        intersection.y <= GRID_CONFIG.halfSize
      ) {
        // Calculate grid cell (0-2 for row and col) - rotated 90 degrees
        const row = Math.floor(intersection.x + GRID_CONFIG.halfSize)
        const col = Math.floor(intersection.y + GRID_CONFIG.halfSize)

        // Calculate cell center position
        const cellX = row - GRID_CONFIG.halfSize + 0.5
        const cellY = col - GRID_CONFIG.halfSize + 0.5

        // Convert to board position
        const position = row * BOARD_SIZE + col

        return { row, col, position, cellX, cellY }
      }

      return null
    },
    []
  )

  /**
   * Creates a mouse move handler for hover highlighting
   */
  const createMouseMoveHandler = useCallback(
    (
      container: HTMLDivElement,
      camera: THREE.Camera,
      hoverHighlight: THREE.Mesh
    ) => {
      return (event: MouseEvent) => {
        const { x: mouseX, y: mouseY } = getNormalizedMouseCoordinates(event, container)
        const cellInfo = getGridCellFromMouse(mouseX, mouseY, camera)

        if (cellInfo) {
          hoverHighlight.position.set(cellInfo.cellX, cellInfo.cellY, HOVER_CONFIG.zOffset)
          hoverHighlight.visible = true
        } else {
          hoverHighlight.visible = false
        }
      }
    },
    [getGridCellFromMouse]
  )

  /**
   * Creates a mouse leave handler
   */
  const createMouseLeaveHandler = useCallback((hoverHighlight: THREE.Mesh) => {
    return () => {
      hoverHighlight.visible = false
    }
  }, [])

  /**
   * Creates a click handler for placing moves
   */
  const createClickHandler = useCallback(
    (
      container: HTMLDivElement,
      camera: THREE.Camera,
      onCellClick: (position: number) => void
    ) => {
      return (event: React.MouseEvent<HTMLDivElement>) => {
        const { x: mouseX, y: mouseY } = getNormalizedMouseCoordinates(event, container)
        const cellInfo = getGridCellFromMouse(mouseX, mouseY, camera)

        if (cellInfo) {
          onCellClick(cellInfo.position)
        }
      }
    },
    [getGridCellFromMouse]
  )

  return {
    getGridCellFromMouse,
    createMouseMoveHandler,
    createMouseLeaveHandler,
    createClickHandler,
  }
}

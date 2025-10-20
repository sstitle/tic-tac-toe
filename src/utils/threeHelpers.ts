import * as THREE from 'three'

/**
 * Converts a board position to 3D coordinates in the XY plane
 */
export function positionToCoordinates(
  position: number,
  boardSize: number,
  halfGridSize: number
): { x: number; y: number } {
  const row = Math.floor(position / boardSize)
  const col = position % boardSize
  const x = row - halfGridSize + 0.5
  const y = col - halfGridSize + 0.5
  return { x, y }
}

/**
 * Converts grid cell coordinates to a board position
 */
export function coordinatesToPosition(row: number, col: number, boardSize: number): number {
  return row * boardSize + col
}

/**
 * Disposes of a Three.js mesh and its geometry/materials
 */
export function disposeMesh(mesh: THREE.Mesh | THREE.Group): void {
  if (mesh instanceof THREE.Mesh) {
    mesh.geometry.dispose()
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m) => m.dispose())
    } else {
      mesh.material.dispose()
    }
  } else if (mesh instanceof THREE.Group) {
    mesh.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
}

/**
 * Disposes of a Three.js line
 */
export function disposeLine(line: THREE.Line): void {
  line.geometry.dispose()
  if (Array.isArray(line.material)) {
    line.material.forEach((m) => m.dispose())
  } else {
    line.material.dispose()
  }
}

/**
 * Calculates normalized mouse coordinates from a mouse event
 */
export function getNormalizedMouseCoordinates(
  event: MouseEvent | React.MouseEvent,
  container: HTMLElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  return { x, y }
}

import * as THREE from 'three'
import {
  GRID_CONFIG,
  SCENE_CONFIG,
  AXIS_COLORS,
  PIECE_CONFIG,
  HOVER_CONFIG,
} from '../config/threeConfig'
import { CellState } from '../domain/types'

/**
 * Factory functions for creating Three.js objects
 * Following Factory Pattern and Single Responsibility Principle
 */

/**
 * Creates a 3x3 grid in the XY plane
 */
export function createGrid(): THREE.Group {
  const gridGroup = new THREE.Group()
  const divisions = GRID_CONFIG.size
  const step = GRID_CONFIG.size / divisions
  const halfSize = GRID_CONFIG.halfSize

  const material = new THREE.LineBasicMaterial({ color: SCENE_CONFIG.gridColor })

  // Grid lines parallel to X axis
  for (let i = 0; i <= divisions; i++) {
    const y = -halfSize + i * step
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfSize, y, 0),
      new THREE.Vector3(halfSize, y, 0),
    ])
    const line = new THREE.Line(geometry, material)
    gridGroup.add(line)
  }

  // Grid lines parallel to Y axis
  for (let i = 0; i <= divisions; i++) {
    const x = -halfSize + i * step
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, -halfSize, 0),
      new THREE.Vector3(x, halfSize, 0),
    ])
    const line = new THREE.Line(geometry, material)
    gridGroup.add(line)
  }

  return gridGroup
}

/**
 * Creates XYZ axes (RGB) - simple lines from origin
 */
export function createAxes(): THREE.Group {
  const axesGroup = new THREE.Group()
  const axisLength = SCENE_CONFIG.axisLength

  // X axis - Red
  const xGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(axisLength, 0, 0),
  ])
  const xMaterial = new THREE.LineBasicMaterial({ color: AXIS_COLORS.x, linewidth: 3 })
  const xAxis = new THREE.Line(xGeometry, xMaterial)
  axesGroup.add(xAxis)

  // Y axis - Green
  const yGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, axisLength, 0),
  ])
  const yMaterial = new THREE.LineBasicMaterial({ color: AXIS_COLORS.y, linewidth: 3 })
  const yAxis = new THREE.Line(yGeometry, yMaterial)
  axesGroup.add(yAxis)

  // Z axis - Blue
  const zGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, axisLength),
  ])
  const zMaterial = new THREE.LineBasicMaterial({ color: AXIS_COLORS.z, linewidth: 3 })
  const zAxis = new THREE.Line(zGeometry, zMaterial)
  axesGroup.add(zAxis)

  return axesGroup
}

/**
 * Creates a hover highlight plane for grid cells
 */
export function createHoverHighlight(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: HOVER_CONFIG.color,
    transparent: true,
    opacity: HOVER_CONFIG.opacity,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.visible = false
  return mesh
}

/**
 * Creates an X piece (red crossed bars)
 */
export function createXPiece(): THREE.Group {
  const material = new THREE.MeshPhongMaterial({ color: PIECE_CONFIG.xColor })
  const group = new THREE.Group()
  const barGeometry = new THREE.BoxGeometry(
    PIECE_CONFIG.xBar.width,
    PIECE_CONFIG.xBar.height,
    PIECE_CONFIG.xBar.depth
  )

  const bar1 = new THREE.Mesh(barGeometry, material)
  bar1.rotation.z = Math.PI / 4
  group.add(bar1)

  const bar2 = new THREE.Mesh(barGeometry, material)
  bar2.rotation.z = -Math.PI / 4
  group.add(bar2)

  return group
}

/**
 * Creates an O piece (blue torus)
 */
export function createOPiece(): THREE.Mesh {
  const material = new THREE.MeshPhongMaterial({ color: PIECE_CONFIG.oColor })
  const geometry = new THREE.TorusGeometry(
    PIECE_CONFIG.oTorus.radius,
    PIECE_CONFIG.oTorus.tube,
    PIECE_CONFIG.oTorus.radialSegments,
    PIECE_CONFIG.oTorus.tubularSegments
  )
  return new THREE.Mesh(geometry, material)
}

/**
 * Creates a game piece based on cell state
 */
export function createGamePiece(cellState: CellState): THREE.Mesh | THREE.Group | null {
  if (cellState === CellState.X) {
    return createXPiece()
  } else if (cellState === CellState.O) {
    return createOPiece()
  }
  return null
}

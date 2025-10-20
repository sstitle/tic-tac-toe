/**
 * Configuration for Three.js 3D game board
 * Following Open/Closed Principle - easy to modify settings without changing logic
 */

export const GRID_CONFIG = {
  size: 3,
  halfSize: 1.5,
} as const

export const CAMERA_CONFIG = {
  fov: 50,
  near: 0.1,
  far: 1000,
  position: { x: 3, y: 3, z: 3 },
} as const

export const LIGHTING_CONFIG = {
  ambient: {
    color: 0xffffff,
    intensity: 0.5,
  },
  directional: {
    color: 0xffffff,
    intensity: 0.8,
    position: { x: 5, y: 5, z: 5 },
  },
} as const

export const SCENE_CONFIG = {
  backgroundColor: 0x1a1a1a,
  gridColor: 0x646cff,
  axisLength: 2,
} as const

export const PIECE_CONFIG = {
  height: 0.15,
  xColor: 0xff0000,
  oColor: 0x0000ff,
  rotationSpeed: 0.005,
  xBar: {
    width: 0.1,
    height: 0.8,
    depth: 0.1,
  },
  oTorus: {
    radius: 0.35,
    tube: 0.08,
    radialSegments: 16,
    tubularSegments: 100,
  },
} as const

export const HOVER_CONFIG = {
  color: 0xffff00,
  opacity: 0.3,
  zOffset: 0.01,
} as const

export const WINNING_LINE_CONFIG = {
  color: 0x00ff00,
  opacity: 0.8,
  zPosition: 0.3,
  tubeRadius: 0.05,
  tubularSegments: 20,
  radialSegments: 8,
} as const

export const AXIS_COLORS = {
  x: 0xff0000, // Red
  y: 0x00ff00, // Green
  z: 0x0000ff, // Blue
} as const

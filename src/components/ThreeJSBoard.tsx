import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CellState, BOARD_SIZE, GameStatus } from '../domain/types'
import { useGame } from './GameProvider'

// Constants
const GRID_SIZE = 3
const HALF_GRID_SIZE = 1.5
const CAMERA_FOV = 50
const CAMERA_POSITION = { x: 3, y: 3, z: 3 }
const PIECE_HEIGHT = 0.15
const HOVER_OPACITY = 0.3
const ROTATION_SPEED = 0.005
const AXIS_LENGTH = 2

export function ThreeJSBoard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const meshesRef = useRef<Map<number, THREE.Group | THREE.Mesh>>(new Map())
  const hoverHighlightRef = useRef<THREE.Mesh | null>(null)
  const axesRef = useRef<THREE.Group | null>(null)
  const winningLineRef = useRef<THREE.Line | null>(null)
  const isAnimatingRef = useRef(true)
  const [showAxes, setShowAxes] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)

  const { gameState, placeMove } = useGame()

  /**
   * Calculates the grid cell position from mouse coordinates using raycasting
   * against the XY plane at z=0.
   * @returns The row, col, board position, and cell center coordinates, or null if outside grid
   */
  const getGridCellFromMouse = (
    mouseX: number,
    mouseY: number,
    camera: THREE.Camera
  ): { row: number; col: number; position: number; cellX: number; cellY: number } | null => {
    // Intersect with XY plane at z=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const raycaster = raycasterRef.current
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera)

    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    // Check if intersection is within grid bounds
    if (
      intersection.x >= -HALF_GRID_SIZE &&
      intersection.x <= HALF_GRID_SIZE &&
      intersection.y >= -HALF_GRID_SIZE &&
      intersection.y <= HALF_GRID_SIZE
    ) {
      // Calculate grid cell (0-2 for row and col) - rotated 90 degrees
      const row = Math.floor(intersection.x + HALF_GRID_SIZE)
      const col = Math.floor(intersection.y + HALF_GRID_SIZE)

      // Calculate cell center position
      const cellX = row - HALF_GRID_SIZE + 0.5
      const cellY = col - HALF_GRID_SIZE + 0.5

      // Convert to board position
      const position = row * BOARD_SIZE + col

      return { row, col, position, cellX, cellY }
    }

    return null
  }

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    // Isometric camera position with Z-up
    camera.up.set(0, 0, 1) // Set Z as up BEFORE lookAt
    camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create 3x3 grid in XY plane (z=0, horizontal floor)
    const createGrid = () => {
      const gridGroup = new THREE.Group()
      const divisions = GRID_SIZE
      const step = GRID_SIZE / divisions
      const halfSize = HALF_GRID_SIZE

      const material = new THREE.LineBasicMaterial({ color: 0x646cff })

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

    const grid = createGrid()
    scene.add(grid)

    // Create XYZ axes (RGB) - simple lines from origin
    const createAxes = () => {
      const axesGroup = new THREE.Group()
      const axisLength = AXIS_LENGTH

      // X axis - Red (pointing in +X direction)
      const xGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(axisLength, 0, 0),
      ])
      const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 })
      const xAxis = new THREE.Line(xGeometry, xMaterial)
      axesGroup.add(xAxis)

      // Y axis - Green (pointing in +Y direction)
      const yGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, axisLength, 0),
      ])
      const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 })
      const yAxis = new THREE.Line(yGeometry, yMaterial)
      axesGroup.add(yAxis)

      // Z axis - Blue (pointing in +Z direction, which is UP)
      const zGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, axisLength),
      ])
      const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 })
      const zAxis = new THREE.Line(zGeometry, zMaterial)
      axesGroup.add(zAxis)

      return axesGroup
    }

    const axes = createAxes()
    scene.add(axes)
    axesRef.current = axes
    axes.visible = showAxes

    // Create hover highlight for grid cells in XY plane
    const hoverGeometry = new THREE.PlaneGeometry(1, 1)
    const hoverMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: HOVER_OPACITY,
      side: THREE.DoubleSide,
    })
    const hoverHighlight = new THREE.Mesh(hoverGeometry, hoverMaterial)
    hoverHighlight.visible = false
    scene.add(hoverHighlight)
    hoverHighlightRef.current = hoverHighlight

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      if (!isAnimatingRef.current) return

      animationFrameId = requestAnimationFrame(animate)

      // Rotate all pieces slightly around X and Y axes for better visibility
      // Only rotate meshes that are still in the scene
      meshesRef.current.forEach((mesh) => {
        if (mesh.parent) {
          mesh.rotation.x += ROTATION_SPEED
          mesh.rotation.y += ROTATION_SPEED
        }
      })

      renderer.render(scene, camera)
    }

    isAnimatingRef.current = true
    animate()

    // Handle mouse move for hover highlighting
    const handleMouseMove = (event: MouseEvent) => {
      if (!container) return

      const rect = container.getBoundingClientRect()
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

      const cellInfo = getGridCellFromMouse(mouseX, mouseY, camera)

      if (cellInfo) {
        // Update hover highlight position
        hoverHighlight.position.set(cellInfo.cellX, cellInfo.cellY, 0.01)
        hoverHighlight.visible = true
      } else {
        hoverHighlight.visible = false
      }
    }

    const handleMouseLeave = () => {
      hoverHighlight.visible = false
    }

    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave)

    // Mark scene as ready
    setSceneReady(true)

    // Cleanup
    return () => {
      isAnimatingRef.current = false
      setSceneReady(false)
      cancelAnimationFrame(animationFrameId)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave)
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }

      // Dispose grid
      grid.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })

      // Dispose axes
      axes.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })

      hoverGeometry.dispose()
      hoverMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  // Separate effect to toggle axes visibility without resetting animations
  useEffect(() => {
    if (axesRef.current) {
      axesRef.current.visible = showAxes
    }
  }, [showAxes])

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

  // Update board based on game state - preserve existing pieces to keep animations
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !sceneReady) return

    // Remove pieces that are no longer on the board
    meshesRef.current.forEach((mesh, position) => {
      if (gameState.board[position] === CellState.Empty) {
        scene.remove(mesh)
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
        meshesRef.current.delete(position)
      }
    })

    // Add new pieces that weren't there before
    gameState.board.forEach((cellState, index) => {
      if (cellState === CellState.Empty || meshesRef.current.has(index)) return

      const row = Math.floor(index / BOARD_SIZE)
      const col = index % BOARD_SIZE

      // Position in XY plane (grid is -1.5 to 1.5) - rotated 90 degrees
      const x = row - HALF_GRID_SIZE + 0.5
      const y = col - HALF_GRID_SIZE + 0.5
      const z = PIECE_HEIGHT // Lower, closer to the grid

      let mesh: THREE.Mesh | THREE.Group

      if (cellState === CellState.X) {
        // Create X shape (red) - rotated for XY plane
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 })
        const group = new THREE.Group()
        const barGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1)

        const bar1 = new THREE.Mesh(barGeometry, material)
        bar1.rotation.z = Math.PI / 4
        group.add(bar1)

        const bar2 = new THREE.Mesh(barGeometry, material)
        bar2.rotation.z = -Math.PI / 4
        group.add(bar2)

        mesh = group
      } else {
        // Create O shape (blue) - in XY plane
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
        const geometry = new THREE.TorusGeometry(0.35, 0.08, 16, 100)
        mesh = new THREE.Mesh(geometry, material)
      }

      mesh.position.set(x, y, z)
      scene.add(mesh)
      meshesRef.current.set(index, mesh)
    })
  }, [gameState.board, sceneReady])

  // Render winning line when game is won
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !sceneReady) return

    // Remove existing winning line if any
    if (winningLineRef.current) {
      scene.remove(winningLineRef.current)
      winningLineRef.current.geometry.dispose()
      if (Array.isArray(winningLineRef.current.material)) {
        winningLineRef.current.material.forEach((m) => m.dispose())
      } else {
        winningLineRef.current.material.dispose()
      }
      winningLineRef.current = null
    }

    // Add winning line if there's a winning pattern
    if (gameState.winningPattern) {
      const points: THREE.Vector3[] = []

      // Convert winning pattern positions to 3D coordinates
      gameState.winningPattern.forEach((position) => {
        const row = Math.floor(position / BOARD_SIZE)
        const col = position % BOARD_SIZE
        const x = row - HALF_GRID_SIZE + 0.5
        const y = col - HALF_GRID_SIZE + 0.5
        const z = 0.3 // Above the pieces
        points.push(new THREE.Vector3(x, y, z))
      })

      // Create a thick line using TubeGeometry for better visibility
      const curve = new THREE.CatmullRomCurve3(points)
      const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false)
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8,
      })
      const winningLine = new THREE.Mesh(tubeGeometry, tubeMaterial) as unknown as THREE.Line

      scene.add(winningLine)
      winningLineRef.current = winningLine
    }
  }, [gameState.winningPattern, sceneReady])

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Prevent clicks when game is over
    if (gameState.status !== GameStatus.Ongoing) return

    const container = containerRef.current
    const camera = cameraRef.current

    if (!container || !camera) return

    const rect = container.getBoundingClientRect()
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const cellInfo = getGridCellFromMouse(mouseX, mouseY, camera)

    if (cellInfo) {
      placeMove(cellInfo.position)
    }
  }

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
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

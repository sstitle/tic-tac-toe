import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CellState, BOARD_SIZE } from '../domain/types'
import { useGame } from './GameProvider'

const DEFAULT_SIZE = 400

export function ThreeJSBoard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const meshesRef = useRef<Map<number, THREE.Group | THREE.Mesh>>(new Map())
  const hoverHighlightRef = useRef<THREE.Mesh | null>(null)

  const { gameState, placeMove } = useGame()

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    // Isometric camera position with Z-up
    camera.up.set(0, 0, 1) // Set Z as up BEFORE lookAt
    camera.position.set(3, 3, 3)
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
      const gridSize = 3
      const divisions = 3
      const step = gridSize / divisions
      const halfSize = gridSize / 2

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

    // Create hover highlight for grid cells in XY plane
    const hoverGeometry = new THREE.PlaneGeometry(1, 1)
    const hoverMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    })
    const hoverHighlight = new THREE.Mesh(hoverGeometry, hoverMaterial)
    hoverHighlight.visible = false
    scene.add(hoverHighlight)
    hoverHighlightRef.current = hoverHighlight

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Rotate all pieces slightly around Z axis
      meshesRef.current.forEach((mesh) => {
        mesh.rotation.z += 0.005
      })

      renderer.render(scene, camera)
    }
    animate()

    // Handle mouse move for hover highlighting
    const handleMouseMove = (event: MouseEvent) => {
      if (!container) return

      const rect = container.getBoundingClientRect()
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Intersect with XY plane at z=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
      const raycaster = raycasterRef.current
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera)

      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, intersection)

      // Check if intersection is within grid bounds (-1.5 to 1.5 in both x and y)
      const gridSize = 3
      const halfSize = gridSize / 2

      if (
        intersection.x >= -halfSize &&
        intersection.x <= halfSize &&
        intersection.y >= -halfSize &&
        intersection.y <= halfSize
      ) {
        // Calculate grid cell (0-2 for row and col)
        const col = Math.floor(intersection.x + halfSize)
        const row = Math.floor(intersection.y + halfSize)

        // Calculate cell center position
        const cellX = col - halfSize + 0.5
        const cellY = row - halfSize + 0.5

        // Update hover highlight position
        hoverHighlight.position.set(cellX, cellY, 0.01)
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

    // Cleanup
    return () => {
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

      hoverGeometry.dispose()
      hoverMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  // Update board based on game state
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    // Clear existing pieces
    meshesRef.current.forEach((mesh, position) => {
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
    })
    meshesRef.current.clear()

    // Create pieces for current board state in XY plane
    gameState.board.forEach((cellState, index) => {
      if (cellState === CellState.Empty) return

      const row = Math.floor(index / BOARD_SIZE)
      const col = index % BOARD_SIZE

      // Position in XY plane (grid is -1.5 to 1.5)
      const halfSize = 1.5
      const x = col - halfSize + 0.5
      const y = row - halfSize + 0.5
      const z = 0.4 // Raised slightly above the grid

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
  }, [gameState.board])

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    const camera = cameraRef.current

    if (!container || !camera) return

    const rect = container.getBoundingClientRect()
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Intersect with XY plane at z=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const raycaster = raycasterRef.current
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera)

    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    // Check if intersection is within grid bounds
    const gridSize = 3
    const halfSize = gridSize / 2

    if (
      intersection.x >= -halfSize &&
      intersection.x <= halfSize &&
      intersection.y >= -halfSize &&
      intersection.y <= halfSize
    ) {
      // Calculate grid cell (0-2)
      const col = Math.floor(intersection.x + halfSize)
      const row = Math.floor(intersection.y + halfSize)

      // Convert to board position
      const position = row * BOARD_SIZE + col
      placeMove(position)
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

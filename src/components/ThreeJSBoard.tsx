import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CellState, BOARD_SIZE } from '../domain/types'
import { useGame } from './GameProvider'

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 600

export function ThreeJSBoard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const meshesRef = useRef<Map<number, THREE.Group | THREE.Mesh>>(new Map())

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
      CANVAS_WIDTH / CANVAS_HEIGHT,
      0.1,
      1000
    )
    camera.position.set(0, 0, 8)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Draw grid lines
    const gridHelper = new THREE.GridHelper(3, 3, 0x646cff, 0x646cff)
    gridHelper.rotation.x = Math.PI / 2
    scene.add(gridHelper)

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Rotate all pieces slightly
      meshesRef.current.forEach((mesh) => {
        mesh.rotation.y += 0.005
      })

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
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

    // Create pieces for current board state
    gameState.board.forEach((cellState, index) => {
      if (cellState === CellState.Empty) return

      const row = Math.floor(index / BOARD_SIZE)
      const col = index % BOARD_SIZE
      const x = (col - 1) * 1.1 // Center around origin
      const z = (row - 1) * 1.1

      let mesh: THREE.Mesh | THREE.Group

      if (cellState === CellState.X) {
        // Create X shape (red)
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 })
        const group = new THREE.Group()
        const barGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1)

        const bar1 = new THREE.Mesh(barGeometry, material)
        bar1.rotation.y = Math.PI / 4
        group.add(bar1)

        const bar2 = new THREE.Mesh(barGeometry, material)
        bar2.rotation.y = -Math.PI / 4
        group.add(bar2)

        mesh = group
      } else {
        // Create O shape (blue)
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
        const geometry = new THREE.TorusGeometry(0.35, 0.08, 16, 100)
        mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.x = Math.PI / 2
      }

      mesh.position.set(x, 0, z)
      scene.add(mesh)
      meshesRef.current.set(index, mesh)
    })
  }, [gameState.board])

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    const camera = cameraRef.current
    const renderer = rendererRef.current

    if (!container || !camera || !renderer) return

    const rect = container.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / CANVAS_WIDTH) * 2 - 1
    const y = -((event.clientY - rect.top) / CANVAS_HEIGHT) * 2 + 1

    // Create a plane at y=0 for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const raycaster = raycasterRef.current
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    // Convert world coordinates to grid position
    const col = Math.round(intersection.x / 1.1) + 1
    const row = Math.round(intersection.z / 1.1) + 1

    // Validate bounds
    if (col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE) {
      const position = row * BOARD_SIZE + col
      placeMove(position)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        ref={containerRef}
        onClick={handleClick}
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          border: '2px solid #646cff',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

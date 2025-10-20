import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type ShapeType = 'cube' | 'x' | 'o'

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentShape, setCurrentShape] = useState<ShapeType>('cube')

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 5, 5)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0x404040))

    camera.position.z = 3

    // Create shapes
    let currentMesh: THREE.Mesh | THREE.Group | null = null
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 })

    const createCube = () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      return new THREE.Mesh(geometry, material)
    }

    const createX = () => {
      const group = new THREE.Group()
      const barGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2)

      const bar1 = new THREE.Mesh(barGeometry, material)
      bar1.rotation.z = Math.PI / 4
      group.add(bar1)

      const bar2 = new THREE.Mesh(barGeometry, material)
      bar2.rotation.z = -Math.PI / 4
      group.add(bar2)

      return group
    }

    const createO = () => {
      const geometry = new THREE.TorusGeometry(0.6, 0.15, 16, 100)
      return new THREE.Mesh(geometry, material)
    }

    const updateShape = () => {
      // Remove current mesh
      if (currentMesh) {
        scene.remove(currentMesh)
        if (currentMesh instanceof THREE.Mesh) {
          currentMesh.geometry.dispose()
        } else if (currentMesh instanceof THREE.Group) {
          currentMesh.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose()
            }
          })
        }
      }

      // Create new mesh based on current shape
      switch (currentShape) {
        case 'cube':
          currentMesh = createCube()
          break
        case 'x':
          currentMesh = createX()
          break
        case 'o':
          currentMesh = createO()
          break
      }

      scene.add(currentMesh)
    }

    updateShape()

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (currentMesh) {
        currentMesh.rotation.x += 0.01
        currentMesh.rotation.y += 0.01
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!container) return

      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      if (currentMesh) {
        if (currentMesh instanceof THREE.Mesh) {
          currentMesh.geometry.dispose()
        } else if (currentMesh instanceof THREE.Group) {
          currentMesh.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose()
            }
          })
        }
      }
      material.dispose()
      renderer.dispose()
    }
  }, [currentShape])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case '1':
          setCurrentShape('cube')
          break
        case '2':
          setCurrentShape('x')
          break
        case '3':
          setCurrentShape('o')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="shape-select" style={{ marginRight: '10px' }}>
          Current Shape: <strong>{currentShape.toUpperCase()}</strong>
        </label>
        <select
          id="shape-select"
          value={currentShape}
          onChange={(e) => setCurrentShape(e.target.value as ShapeType)}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #646cff',
            backgroundColor: '#1a1a1a',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="cube">Cube (Press 1)</option>
          <option value="x">X (Press 2)</option>
          <option value="o">O (Press 3)</option>
        </select>
      </div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #646cff',
          borderRadius: '8px',
        }}
      />
    </div>
  )
}

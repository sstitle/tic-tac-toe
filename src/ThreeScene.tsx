import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type ShapeType = 'cube' | 'x' | 'o'

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentShape, setCurrentShape] = useState<ShapeType>('cube')
  const [showAxes, setShowAxes] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)

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
    light.position.set(5, 3, 8)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0x404040))

    // Z-up camera position (looking down at XY plane from above and angle)
    camera.position.set(3, 3, 4)
    camera.lookAt(0, 0, 0)
    camera.up.set(0, 0, 1) // Z is up

    // Create XYZ axes (RGB)
    const createAxes = () => {
      const axesGroup = new THREE.Group()
      const axisLength = 2
      const axisRadius = 0.02

      // X axis - Red
      const xGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8)
      const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      const xAxis = new THREE.Mesh(xGeometry, xMaterial)
      xAxis.rotation.z = -Math.PI / 2
      xAxis.position.x = axisLength / 2
      axesGroup.add(xAxis)

      // Y axis - Green
      const yGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8)
      const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      const yAxis = new THREE.Mesh(yGeometry, yMaterial)
      yAxis.rotation.x = Math.PI / 2
      yAxis.position.y = axisLength / 2
      axesGroup.add(yAxis)

      // Z axis - Blue
      const zGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8)
      const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff })
      const zAxis = new THREE.Mesh(zGeometry, zMaterial)
      zAxis.position.z = axisLength / 2
      axesGroup.add(zAxis)

      return axesGroup
    }

    // Create 3x3 grid in XY plane
    const createGrid = () => {
      const gridGroup = new THREE.Group()
      const gridSize = 3
      const divisions = 3
      const step = gridSize / divisions
      const halfSize = gridSize / 2

      const material = new THREE.LineBasicMaterial({ color: 0x444444 })

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

    const axes = createAxes()
    const grid = createGrid()

    if (showAxes) scene.add(axes)
    if (showGrid) scene.add(grid)

    // Create shapes
    let currentMesh: THREE.Mesh | THREE.Group | null = null

    // Create separate materials for each shape
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 }) // Green
    const xMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }) // Red
    const oMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff }) // Blue

    const createCube = () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      return new THREE.Mesh(geometry, cubeMaterial)
    }

    const createX = () => {
      const group = new THREE.Group()
      const barGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2)

      const bar1 = new THREE.Mesh(barGeometry, xMaterial)
      bar1.rotation.z = Math.PI / 4
      group.add(bar1)

      const bar2 = new THREE.Mesh(barGeometry, xMaterial)
      bar2.rotation.z = -Math.PI / 4
      group.add(bar2)

      return group
    }

    const createO = () => {
      const geometry = new THREE.TorusGeometry(0.6, 0.15, 16, 100)
      return new THREE.Mesh(geometry, oMaterial)
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

      // Dispose axes
      axes.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })

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

      // Dispose current mesh
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
      cubeMaterial.dispose()
      xMaterial.dispose()
      oMaterial.dispose()
      renderer.dispose()
    }
  }, [currentShape, showAxes, showGrid])

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
        case 'a':
        case 'A':
          setShowAxes((prev) => !prev)
          break
        case 'g':
        case 'G':
          setShowGrid((prev) => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '10px', color: '#fff' }}>
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
              border: '1px solid #444',
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
        <div style={{ fontSize: '14px', color: '#999' }}>
          Press <strong>A</strong> to toggle axes ({showAxes ? 'ON' : 'OFF'}) | Press <strong>G</strong> to toggle grid ({showGrid ? 'ON' : 'OFF'})
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          width: '600px',
          height: '600px',
          border: '2px solid #444',
          borderRadius: '8px',
          margin: '0 auto',
        }}
      />
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CAMERA_CONFIG, LIGHTING_CONFIG, SCENE_CONFIG } from '../config/threeConfig'
import { createGrid, createAxes, createHoverHighlight } from '../utils/threeFactories'
import { disposeLine } from '../utils/threeHelpers'

export interface ThreeSceneRefs {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  grid: THREE.Group
  axes: THREE.Group
  hoverHighlight: THREE.Mesh
}

/**
 * Custom hook for Three.js scene initialization and cleanup
 * Follows Single Responsibility Principle - only manages scene setup
 */
export function useThreeScene(containerRef: React.RefObject<HTMLDivElement>) {
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const gridRef = useRef<THREE.Group | null>(null)
  const axesRef = useRef<THREE.Group | null>(null)
  const hoverHighlightRef = useRef<THREE.Mesh | null>(null)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      container.clientWidth / container.clientHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    )
    camera.up.set(0, 0, 1) // Set Z as up BEFORE lookAt
    camera.position.set(CAMERA_CONFIG.position.x, CAMERA_CONFIG.position.y, CAMERA_CONFIG.position.z)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      LIGHTING_CONFIG.ambient.color,
      LIGHTING_CONFIG.ambient.intensity
    )
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(
      LIGHTING_CONFIG.directional.color,
      LIGHTING_CONFIG.directional.intensity
    )
    directionalLight.position.set(
      LIGHTING_CONFIG.directional.position.x,
      LIGHTING_CONFIG.directional.position.y,
      LIGHTING_CONFIG.directional.position.z
    )
    scene.add(directionalLight)

    // Create grid
    const grid = createGrid()
    scene.add(grid)
    gridRef.current = grid

    // Create axes
    const axes = createAxes()
    scene.add(axes)
    axesRef.current = axes
    axes.visible = false

    // Create hover highlight
    const hoverHighlight = createHoverHighlight()
    scene.add(hoverHighlight)
    hoverHighlightRef.current = hoverHighlight

    setSceneReady(true)

    // Cleanup
    return () => {
      setSceneReady(false)

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }

      // Dispose grid
      grid.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          disposeLine(child)
        }
      })

      // Dispose axes
      axes.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          disposeLine(child)
        }
      })

      // Dispose hover highlight
      hoverHighlight.geometry.dispose()
      if (Array.isArray(hoverHighlight.material)) {
        hoverHighlight.material.forEach((m) => m.dispose())
      } else {
        hoverHighlight.material.dispose()
      }

      renderer.dispose()
    }
  }, [containerRef])

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    gridRef,
    axesRef,
    hoverHighlightRef,
    sceneReady,
  }
}

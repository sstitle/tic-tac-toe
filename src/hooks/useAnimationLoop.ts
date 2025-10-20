import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { PIECE_CONFIG } from '../config/threeConfig'

/**
 * Custom hook for animation loop with piece rotation
 * Follows Single Responsibility Principle - only manages animation
 */
export function useAnimationLoop(
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  sceneRef: React.RefObject<THREE.Scene | null>,
  cameraRef: React.RefObject<THREE.Camera | null>,
  meshesRef: React.RefObject<Map<number, THREE.Group | THREE.Mesh>>
) {
  const isAnimatingRef = useRef(true)

  useEffect(() => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current

    if (!renderer || !scene || !camera) return

    let animationFrameId: number

    const animate = () => {
      if (!isAnimatingRef.current) return

      animationFrameId = requestAnimationFrame(animate)

      // Rotate all pieces slightly around X and Y axes for better visibility
      // Only rotate meshes that are still in the scene
      meshesRef.current?.forEach((mesh) => {
        if (mesh.parent) {
          mesh.rotation.x += PIECE_CONFIG.rotationSpeed
          mesh.rotation.y += PIECE_CONFIG.rotationSpeed
        }
      })

      renderer.render(scene, camera)
    }

    isAnimatingRef.current = true
    animate()

    return () => {
      isAnimatingRef.current = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [rendererRef, sceneRef, cameraRef, meshesRef])
}

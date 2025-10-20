import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { BOARD_SIZE } from '../domain/types'
import { WINNING_LINE_CONFIG } from '../config/threeConfig'
import { positionToCoordinates } from '../utils/threeHelpers'
import { GRID_CONFIG } from '../config/threeConfig'

/**
 * Custom hook for rendering the winning line
 * Follows Single Responsibility Principle - only manages winning line visualization
 */
export function useWinningLine(
  sceneRef: React.RefObject<THREE.Scene | null>,
  winningPattern: number[] | null,
  sceneReady: boolean
) {
  const winningLineRef = useRef<THREE.Line | null>(null)

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
    if (winningPattern) {
      const points: THREE.Vector3[] = []

      // Convert winning pattern positions to 3D coordinates
      winningPattern.forEach((position) => {
        const { x, y } = positionToCoordinates(position, BOARD_SIZE, GRID_CONFIG.halfSize)
        const z = WINNING_LINE_CONFIG.zPosition
        points.push(new THREE.Vector3(x, y, z))
      })

      // Create a thick line using TubeGeometry for better visibility
      const curve = new THREE.CatmullRomCurve3(points)
      const tubeGeometry = new THREE.TubeGeometry(
        curve,
        WINNING_LINE_CONFIG.tubularSegments,
        WINNING_LINE_CONFIG.tubeRadius,
        WINNING_LINE_CONFIG.radialSegments,
        false
      )
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: WINNING_LINE_CONFIG.color,
        transparent: true,
        opacity: WINNING_LINE_CONFIG.opacity,
      })
      const winningLine = new THREE.Mesh(tubeGeometry, tubeMaterial) as unknown as THREE.Line

      scene.add(winningLine)
      winningLineRef.current = winningLine
    }
  }, [winningPattern, sceneReady, sceneRef])

  return { winningLineRef }
}

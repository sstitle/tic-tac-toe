import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ShaderCanvasProps {
  fragmentShader: string
  uniforms?: Record<string, { value: any }>
  style?: React.CSSProperties
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export function ShaderCanvas({ fragmentShader, uniforms = {}, style }: ShaderCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Prevent double-mounting
    if (containerRef.current.querySelector('canvas')) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const geometry = new THREE.PlaneGeometry(2, 2)

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        )},
        ...uniforms
      },
      vertexShader,
      fragmentShader
    })
    materialRef.current = material

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      material.uniforms.time.value = clock.getElapsedTime()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      renderer.setSize(width, height)
      material.uniforms.resolution.value.set(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)

      geometry.dispose()
      material.dispose()
      renderer.dispose()

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }

      rendererRef.current = null
      materialRef.current = null
    }
  }, [])

  // Update uniforms when they change
  useEffect(() => {
    if (!materialRef.current) return

    const material = materialRef.current
    Object.entries(uniforms).forEach(([key, uniform]) => {
      if (material.uniforms[key]) {
        material.uniforms[key].value = uniform.value
      }
    })
  }, [uniforms])

  // Update shader when it changes
  useEffect(() => {
    if (!materialRef.current) return

    materialRef.current.fragmentShader = fragmentShader
    materialRef.current.needsUpdate = true
  }, [fragmentShader])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', ...style }}
    />
  )
}

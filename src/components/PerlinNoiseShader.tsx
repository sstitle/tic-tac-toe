import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface NoiseParams {
  scale: number
  octaves: number
  lacunarity: number
  persistence: number
  animSpeed: number
  colorMode: number
  contrast: number
  brightness: number
}

// Vertex shader - simple pass-through
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fragment shader with Perlin noise implementation
const fragmentShader = `
  uniform float time;
  uniform float scale;
  uniform int octaves;
  uniform float lacunarity;
  uniform float persistence;
  uniform float animSpeed;
  uniform int colorMode;
  uniform float contrast;
  uniform float brightness;
  varying vec2 vUv;

  // Permutation table for Perlin noise
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  // Perlin noise function
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0

    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);

    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Configurable Fractal Brownian Motion
  float fbm(vec2 p, int oct, float lac, float pers) {
    float value = 0.0;
    float amplitude = pers;
    float frequency = 1.0;

    for(int i = 0; i < 8; i++) {
      if(i >= oct) break;
      value += amplitude * snoise(p * frequency);
      frequency *= lac;
      amplitude *= pers;
    }

    return value;
  }

  void main() {
    // Create animated noise pattern
    vec2 uv = vUv * scale;
    vec2 timeOffset = vec2(time * animSpeed);

    vec3 color;

    if(colorMode == 0) {
      // Grayscale mode
      float n = fbm(uv + timeOffset, octaves, lacunarity, persistence);
      n = brightness + n * 0.5 + 0.5;
      color = vec3(n);
    } else if(colorMode == 1) {
      // RGB channels mode
      float r = 0.5 + 0.5 * fbm(uv + timeOffset * vec2(1.0, 0.0), octaves, lacunarity, persistence);
      float g = 0.5 + 0.5 * fbm(uv + timeOffset * vec2(0.0, 1.5), octaves, lacunarity, persistence);
      float b = 0.5 + 0.5 * fbm(uv + timeOffset * vec2(1.2, 1.3), octaves, lacunarity, persistence);
      color = brightness + vec3(r, g, b);
    } else if(colorMode == 2) {
      // Marble mode
      float n = fbm(uv + timeOffset, octaves, lacunarity, persistence);
      n = sin(uv.x + n * 3.0);
      n = brightness + n * 0.5 + 0.5;
      color = vec3(n);
    } else if(colorMode == 3) {
      // Wood grain mode
      float n = fbm(uv + timeOffset, octaves, lacunarity, persistence);
      float rings = sin(length(uv) * 10.0 + n * 5.0);
      rings = brightness + rings * 0.5 + 0.5;
      color = vec3(rings * 0.6, rings * 0.4, rings * 0.2);
    } else {
      // Fire mode
      float n = fbm(uv + timeOffset * vec2(0.5, 2.0), octaves, lacunarity, persistence);
      n = brightness + n * 0.5 + 0.5;
      color = vec3(n * n, n * n * 0.5, n * 0.1);
    }

    // Apply contrast
    color = pow(color, vec3(contrast));

    // Clamp to valid range
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`

interface PerlinNoiseShaderProps {
  onBack: () => void
}

const colorModes = ['Grayscale', 'RGB Channels', 'Marble', 'Wood Grain', 'Fire']

const presets: Record<string, NoiseParams> = {
  'Clouds': { scale: 3, octaves: 6, lacunarity: 2.0, persistence: 0.5, animSpeed: 0.05, colorMode: 0, contrast: 1.2, brightness: 0 },
  'Marble': { scale: 5, octaves: 5, lacunarity: 2.0, persistence: 0.5, animSpeed: 0.02, colorMode: 2, contrast: 1.5, brightness: 0 },
  'Wood': { scale: 4, octaves: 4, lacunarity: 2.0, persistence: 0.6, animSpeed: 0.01, colorMode: 3, contrast: 1.3, brightness: 0 },
  'Fire': { scale: 6, octaves: 5, lacunarity: 2.5, persistence: 0.4, animSpeed: 0.2, colorMode: 4, contrast: 2.0, brightness: 0 },
  'Psychedelic': { scale: 8, octaves: 7, lacunarity: 2.2, persistence: 0.5, animSpeed: 0.15, colorMode: 1, contrast: 1.8, brightness: 0 },
}

export function PerlinNoiseShader({ onBack }: PerlinNoiseShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const [showControls, setShowControls] = useState(true)

  const [params, setParams] = useState<NoiseParams>({
    scale: 5,
    octaves: 5,
    lacunarity: 2.0,
    persistence: 0.5,
    animSpeed: 0.1,
    colorMode: 1,
    contrast: 1.5,
    brightness: 0
  })

  const updateParam = <K extends keyof NoiseParams>(key: K, value: NoiseParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const loadPreset = (presetName: string) => {
    const preset = presets[presetName]
    if (preset) {
      setParams(preset)
    }
  }

  const exportTexture = (size: number) => {
    if (!rendererRef.current || !materialRef.current) return

    const renderer = rendererRef.current
    const material = materialRef.current

    // Create a new scene for export
    const exportScene = new THREE.Scene()
    const exportCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const exportGeometry = new THREE.PlaneGeometry(2, 2)
    const exportMesh = new THREE.Mesh(exportGeometry, material)
    exportScene.add(exportMesh)

    // Create render target
    const renderTarget = new THREE.WebGLRenderTarget(size, size)
    renderer.setRenderTarget(renderTarget)
    renderer.render(exportScene, exportCamera)
    renderer.setRenderTarget(null)

    // Read pixels
    const buffer = new Uint8Array(size * size * 4)
    renderer.readRenderTargetPixels(renderTarget, 0, 0, size, size, buffer)

    // Create canvas and draw
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.createImageData(size, size)

    // Flip Y-axis (WebGL to canvas coordinate system)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcIdx = ((size - y - 1) * size + x) * 4
        const dstIdx = (y * size + x) * 4
        imageData.data[dstIdx] = buffer[srcIdx]
        imageData.data[dstIdx + 1] = buffer[srcIdx + 1]
        imageData.data[dstIdx + 2] = buffer[srcIdx + 2]
        imageData.data[dstIdx + 3] = buffer[srcIdx + 3]
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Download
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `perlin-noise-${size}x${size}.png`
      a.click()
      URL.revokeObjectURL(url)
    })

    // Cleanup
    exportGeometry.dispose()
    renderTarget.dispose()
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Prevent double-mounting - check if canvas already exists
    if (containerRef.current.querySelector('canvas')) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2)

    // Create shader material with uniforms
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scale: { value: params.scale },
        octaves: { value: params.octaves },
        lacunarity: { value: params.lacunarity },
        persistence: { value: params.persistence },
        animSpeed: { value: params.animSpeed },
        colorMode: { value: params.colorMode },
        contrast: { value: params.contrast },
        brightness: { value: params.brightness }
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

      // Update time uniform
      material.uniforms.time.value = clock.getElapsedTime()

      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)

      geometry.dispose()
      material.dispose()
      renderer.dispose()

      // Remove the canvas element
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }

      rendererRef.current = null
      materialRef.current = null
    }
  }, [])

  // Update uniforms when params change
  useEffect(() => {
    if (!materialRef.current) return

    const material = materialRef.current
    material.uniforms.scale.value = params.scale
    material.uniforms.octaves.value = params.octaves
    material.uniforms.lacunarity.value = params.lacunarity
    material.uniforms.persistence.value = params.persistence
    material.uniforms.animSpeed.value = params.animSpeed
    material.uniforms.colorMode.value = params.colorMode
    material.uniforms.contrast.value = params.contrast
    material.uniforms.brightness.value = params.brightness
  }, [params])

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid #333',
          borderRadius: '5px',
          zIndex: 1000
        }}
      >
        Back to Home
      </button>

      {/* Toggle controls button */}
      <button
        onClick={() => setShowControls(!showControls)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid #333',
          borderRadius: '5px',
          zIndex: 1000
        }}
      >
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </button>

      {/* Controls panel */}
      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            borderRadius: '10px',
            fontSize: '14px',
            zIndex: 1000,
            maxWidth: '350px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Texture Parameters</h3>

          {/* Presets */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Presets:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {Object.keys(presets).map(presetName => (
                <button
                  key={presetName}
                  onClick={() => loadPreset(presetName)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: '#444',
                    color: 'white',
                    border: '1px solid #666',
                    borderRadius: '4px'
                  }}
                >
                  {presetName}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Scale: {params.scale.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={params.scale}
              onChange={e => updateParam('scale', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Octaves */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Octaves: {params.octaves}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={params.octaves}
              onChange={e => updateParam('octaves', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Lacunarity */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Lacunarity: {params.lacunarity.toFixed(2)}
            </label>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={params.lacunarity}
              onChange={e => updateParam('lacunarity', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Persistence */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Persistence: {params.persistence.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.persistence}
              onChange={e => updateParam('persistence', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Animation Speed */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Animation Speed: {params.animSpeed.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={params.animSpeed}
              onChange={e => updateParam('animSpeed', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Contrast */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Contrast: {params.contrast.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={params.contrast}
              onChange={e => updateParam('contrast', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Brightness */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Brightness: {params.brightness.toFixed(2)}
            </label>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.05"
              value={params.brightness}
              onChange={e => updateParam('brightness', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Color Mode */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Color Mode:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {colorModes.map((mode, index) => (
                <button
                  key={index}
                  onClick={() => updateParam('colorMode', index)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: params.colorMode === index ? '#0066cc' : '#444',
                    color: 'white',
                    border: '1px solid #666',
                    borderRadius: '4px'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Export buttons */}
          <div style={{ borderTop: '1px solid #666', paddingTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Export Texture:</label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {[512, 1024, 2048, 4096].map(size => (
                <button
                  key={size}
                  onClick={() => exportTexture(size)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

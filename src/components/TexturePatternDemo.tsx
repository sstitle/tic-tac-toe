import { useState } from 'react'
import { ShaderCanvas } from './ShaderCanvas'
import {
  gradientPattern,
  perlinPattern,
  xorPattern,
  composeShaders,
  singlePattern,
  type Layer,
  type GradientParams,
  type PerlinParams,
  type XorParams
} from '../shaders'

interface TexturePatternDemoProps {
  onBack: () => void
}

type PatternType = 'gradient' | 'perlin' | 'xor'

export function TexturePatternDemo({ onBack }: TexturePatternDemoProps) {
  const [patternType, setPatternType] = useState<PatternType>('gradient')

  // Gradient parameters
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'angular'>('radial')
  const [gradientAngle, setGradientAngle] = useState(0)

  // Perlin parameters
  const [perlinScale, setPerlinScale] = useState(5)
  const [perlinOctaves, setPerlinOctaves] = useState(4)
  const [perlinAnimate, setPerlinAnimate] = useState(true)

  // XOR parameters
  const [xorScale, setXorScale] = useState(10)
  const [xorAnimate, setXorAnimate] = useState(true)

  const getShader = (): string => {
    switch (patternType) {
      case 'gradient': {
        const params: GradientParams = {
          type: gradientType,
          angle: gradientAngle
        }
        return singlePattern(gradientPattern(params))
      }

      case 'perlin': {
        const params: PerlinParams = {
          scale: perlinScale,
          octaves: perlinOctaves,
          animate: perlinAnimate
        }
        return singlePattern(perlinPattern(params))
      }

      case 'xor': {
        const params: XorParams = {
          scale: xorScale,
          animate: xorAnimate
        }
        return singlePattern(xorPattern(params))
      }
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <ShaderCanvas fragmentShader={getShader()} />

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

      {/* Controls panel */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          borderRadius: '10px',
          fontSize: '14px',
          zIndex: 1000,
          minWidth: '300px'
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Texture Patterns</h3>

        {/* Pattern Type Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Pattern Type:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setPatternType('gradient')}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: patternType === 'gradient' ? '#0066cc' : '#444',
                color: 'white',
                border: '1px solid #666',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              Gradient
            </button>

            <button
              onClick={() => setPatternType('perlin')}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: patternType === 'perlin' ? '#0066cc' : '#444',
                color: 'white',
                border: '1px solid #666',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              Perlin Noise
            </button>

            <button
              onClick={() => setPatternType('xor')}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: patternType === 'xor' ? '#0066cc' : '#444',
                color: 'white',
                border: '1px solid #666',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              XOR Pattern
            </button>
          </div>
        </div>

        {/* Gradient Controls */}
        {patternType === 'gradient' && (
          <div style={{ borderTop: '1px solid #666', paddingTop: '15px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Gradient Settings</h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Type:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {['linear', 'radial', 'angular'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setGradientType(type as any)}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      backgroundColor: gradientType === type ? '#0066cc' : '#333',
                      color: 'white',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {gradientType === 'linear' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Angle: {Math.round((gradientAngle * 180) / Math.PI)}°
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step="0.1"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Perlin Noise Controls */}
        {patternType === 'perlin' && (
          <div style={{ borderTop: '1px solid #666', paddingTop: '15px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Perlin Noise Settings</h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Scale: {perlinScale.toFixed(1)}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={perlinScale}
                onChange={(e) => setPerlinScale(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Octaves: {perlinOctaves}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={perlinOctaves}
                onChange={(e) => setPerlinOctaves(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={perlinAnimate}
                  onChange={(e) => setPerlinAnimate(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Animate
              </label>
            </div>
          </div>
        )}

        {/* XOR Pattern Controls */}
        {patternType === 'xor' && (
          <div style={{ borderTop: '1px solid #666', paddingTop: '15px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px' }}>XOR Pattern Settings</h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Scale: {xorScale.toFixed(1)}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={xorScale}
                onChange={(e) => setXorScale(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={xorAnimate}
                  onChange={(e) => setXorAnimate(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Animate
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

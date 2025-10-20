interface PatternResult {
  code: string
  uniforms: Record<string, { value: any }>
}

export type BlendMode = 'normal' | 'add' | 'multiply' | 'screen' | 'overlay'

export interface Layer {
  pattern: PatternResult
  blendMode?: BlendMode
  opacity?: number
}

function getBlendFunction(mode: BlendMode): string {
  switch (mode) {
    case 'add':
      return 'base + blend'
    case 'multiply':
      return 'base * blend'
    case 'screen':
      return '1.0 - (1.0 - base) * (1.0 - blend)'
    case 'overlay':
      return `mix(
        2.0 * base * blend,
        1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
        step(0.5, base)
      )`
    case 'normal':
    default:
      return 'blend'
  }
}

export function composeShaders(layers: Layer[]): string {
  if (layers.length === 0) {
    return `
      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;

      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    `
  }

  // Rename each pattern function individually to avoid conflicts
  const processedFunctions = layers.map((layer, index) => {
    const functionNames = ['gradient', 'perlinNoise', 'xorPattern']
    let code = layer.pattern.code

    // Replace the main function name with pattern_N
    functionNames.forEach(name => {
      const regex = new RegExp(`vec3 ${name}\\(`, 'g')
      const replacement = `vec3 pattern_${index}(`
      code = code.replace(regex, replacement)
    })

    return code
  }).join('\n')

  // Build composition logic
  const compositionCode = layers.map((layer, index) => {
    const functionName = `pattern_${index}`
    const blendMode = layer.blendMode || 'normal'
    const opacity = layer.opacity ?? 1.0

    if (index === 0) {
      return `vec3 color = ${functionName}(vUv, time);`
    } else {
      const blendFunc = getBlendFunction(blendMode)
      return `
      {
        vec3 blend = ${functionName}(vUv, time);
        color = mix(color, ${blendFunc.replace(/base/g, 'color').replace(/blend/g, 'blend')}, ${opacity.toFixed(4)});
      }`
    }
  }).join('\n')

  return `
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    ${processedFunctions}

    void main() {
      ${compositionCode}

      gl_FragColor = vec4(color, 1.0);
    }
  `
}

// Convenience function for single pattern
export function singlePattern(pattern: PatternResult): string {
  return composeShaders([{ pattern }])
}

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function GlobeMesh() {
  const group = useRef<THREE.Group>(null)
  const geometry = useMemo(() => {
    const points: number[] = []
    const colors: number[] = []
    const violet = new THREE.Color('#a970f4')
    const green = new THREE.Color('#32c9a6')
    const rings = 20
    const segments = 40
    for (let ring = 1; ring < rings; ring++) {
      const phi = (ring / rings) * Math.PI
      for (let segment = 0; segment < segments; segment++) {
        const theta = (segment / segments) * Math.PI * 2
        const nextTheta = ((segment + 1) / segments) * Math.PI * 2
        const nextPhi = ((ring + 1) / rings) * Math.PI
        const point = (p: number, t: number) => [2.3 * Math.sin(p) * Math.cos(t), 2.3 * Math.cos(p), 2.3 * Math.sin(p) * Math.sin(t)]
        const c = violet.clone().lerp(green, Math.max(0, Math.sin(theta + phi * 3) * .36 + .28))
        const addLine = (a: number[], b: number[]) => {
          points.push(...a, ...b)
          colors.push(c.r, c.g, c.b, c.r, c.g, c.b)
        }
        addLine(point(phi, theta), point(phi, nextTheta))
        if (ring < rings - 1 && segment % 2 === 0) addLine(point(phi, theta), point(nextPhi, theta))
      }
    }
    const output = new THREE.BufferGeometry()
    output.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    output.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return output
  }, [])
  useFrame((_, delta) => {
    if (group.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      group.current.rotation.y += Math.min(delta, .05) * .11
      group.current.rotation.z += Math.min(delta, .05) * .025
    }
  })
  return <group ref={group} rotation={[.15, -.35, -.2]}><lineSegments geometry={geometry}><lineBasicMaterial vertexColors transparent opacity={.58} /></lineSegments><mesh><sphereGeometry args={[2.29, 32, 24]} /><meshBasicMaterial color="#321b4d" transparent opacity={.1} depthWrite={false} /></mesh></group>
}

export function Globe() {
  return <Canvas flat dpr={[1, 1.5]} camera={{ position: [0, 0, 7], fov: 55 }} gl={{ alpha: true, antialias: true }}><GlobeMesh /></Canvas>
}

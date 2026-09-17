import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'

// Procedural two-stage rocket (Falcon-9 proportions, simplified).
// Real glTF models can replace each stage group later — the exploded-view
// offsets and rotation logic stay the same.

const HULL = '#d8dde6'
const DARK = '#2a2f3a'
const ENGINE = '#8a8f99'
const INTERSTAGE = '#1d2129'

function Engine({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.16, 0.3, 0.5, 24]} />
        <meshStandardMaterial color={ENGINE} metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  )
}

function Stage1({ offset }) {
  const engines = []
  engines.push([0, -3.15, 0])
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    engines.push([Math.cos(a) * 0.62, -3.15, Math.sin(a) * 0.62])
  }
  return (
    <group position={[0, offset, 0]}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 6, 40]} />
        <meshStandardMaterial color={HULL} metalness={0.25} roughness={0.4} />
      </mesh>
      {/* landing legs (folded) */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.99, -1.6, Math.sin(a) * 0.99]}
            rotation={[0, -a, 0.06]}
          >
            <boxGeometry args={[0.09, 2.6, 0.32]} />
            <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.5} />
          </mesh>
        )
      })}
      {/* grid fins */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 1.08, 2.55, Math.sin(a) * 1.08]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.06, 0.55, 0.42]} />
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} />
          </mesh>
        )
      })}
      {engines.map((p, i) => (
        <Engine key={i} position={p} scale={0.9} />
      ))}
    </group>
  )
}

function Interstage({ offset }) {
  return (
    <group position={[0, offset, 0]}>
      <mesh position={[0, 3.25, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.7, 40]} />
        <meshStandardMaterial color={INTERSTAGE} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Stage2({ offset }) {
  return (
    <group position={[0, offset, 0]}>
      <mesh position={[0, 4.55, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 1.9, 40]} />
        <meshStandardMaterial color={HULL} metalness={0.25} roughness={0.4} />
      </mesh>
      <Engine position={[0, 3.45, 0]} scale={1.25} />
    </group>
  )
}

function Fairing({ offset }) {
  return (
    <group position={[0, offset, 0]}>
      <mesh position={[0, 6.1, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 1.2, 40]} />
        <meshStandardMaterial color={HULL} metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh position={[0, 7.15, 0]}>
        <cylinderGeometry args={[0.35, 0.98, 0.9, 40]} />
        <meshStandardMaterial color={HULL} metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh position={[0, 7.75, 0]}>
        <sphereGeometry args={[0.35, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={HULL} metalness={0.25} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Rocket({ exploded, spinning }) {
  const ref = useRef()
  const sep = useRef(0)

  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += delta * 0.35
    // animate stage separation smoothly
    const targetSep = exploded ? 1 : 0
    sep.current += (targetSep - sep.current) * Math.min(1, delta * 4)
    if (ref.current) ref.current.userData.sep = sep.current
  })

  // group offsets are driven per-frame via a wrapper so React doesn't re-render at 60fps
  return (
    <group ref={ref} position={[0, -2.2, 0]}>
      <AnimatedStages sepRef={sep} />
    </group>
  )
}

function AnimatedStages({ sepRef }) {
  const g1 = useRef()
  const g2 = useRef()
  const g3 = useRef()
  const g4 = useRef()

  useFrame(() => {
    const s = sepRef.current
    if (g1.current) g1.current.position.y = 0
    if (g2.current) g2.current.position.y = s * 0.9
    if (g3.current) g3.current.position.y = s * 1.8
    if (g4.current) g4.current.position.y = s * 3.0
  })

  return (
    <>
      <group ref={g1}><Stage1 offset={0} /></group>
      <group ref={g2}><Interstage offset={0} /></group>
      <group ref={g3}><Stage2 offset={0} /></group>
      <group ref={g4}><Fairing offset={0} /></group>
    </>
  )
}

export default function RocketViewer() {
  const [exploded, setExploded] = useState(false)
  const [spinning, setSpinning] = useState(true)

  return (
    <div>
      <div className="hangar-canvas">
        <Canvas camera={{ position: [11, 5, 11], fov: 42 }}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[6, 10, 4]} intensity={1.4} />
          <directionalLight position={[-6, 2, -4]} intensity={0.4} color="#7aa2ff" />
          <Suspense
            fallback={
              <Html center>
                <span style={{ color: '#5c6a8c', fontFamily: 'monospace' }}>LOADING…</span>
              </Html>
            }
          >
            <Stars radius={60} depth={30} count={2500} factor={3} fade speed={0.5} />
            <Rocket exploded={exploded} spinning={spinning} />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={6} maxDistance={26} target={[0, 2, 0]} />
        </Canvas>
      </div>
      <div className="hangar-controls">
        <button className={`ctl-btn ${exploded ? 'on' : ''}`} onClick={() => setExploded(!exploded)}>
          {exploded ? 'חיבור שלבים' : 'הפרדת שלבים'}
        </button>
        <button className={`ctl-btn ${spinning ? 'on' : ''}`} onClick={() => setSpinning(!spinning)}>
          {spinning ? 'עצירת סיבוב' : 'סיבוב אוטומטי'}
        </button>
      </div>
      <p className="hint">
        גרירה עם העכבר מסובבת את המודל, גלגלת מקרבת ומרחיקה. המודל בנוי פרוצדורלית בפרופורציות של
        Falcon 9; בשלב הבא נחליף אותו במודלי glTF אמיתיים לכל טיל.
      </p>
    </div>
  )
}

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'

// Procedural 3D models (Falcon 9 proportions, Starship stack, Electron),
// each split into stages that animate apart in exploded view.

const HULL = '#d8dde6'
const DARK = '#2a2f3a'
const ENGINE = '#8a8f99'
const INTERSTAGE = '#1d2129'
const STEEL = '#b8bfc9'
const CARBON = '#15181f'

function ring(n, radius) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [Math.cos(a) * radius, Math.sin(a) * radius]
  })
}

function Engine({ position, scale = 1, color = ENGINE }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.16, 0.3, 0.5, 24]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  )
}

function Tube({ y, h, r, color = HULL, rTop }) {
  return (
    <mesh position={[0, y + h / 2, 0]}>
      <cylinderGeometry args={[rTop ?? r, r, h, 40]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
    </mesh>
  )
}

function Nose({ y, r, h, color = HULL }) {
  return (
    <>
      <mesh position={[0, y + h * 0.45, 0]}>
        <cylinderGeometry args={[r * 0.36, r, h * 0.9, 40]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, y + h * 0.9, 0]}>
        <sphereGeometry args={[r * 0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
    </>
  )
}

/* ---------- Falcon 9 ---------- */

function Falcon9({ sepRef }) {
  const g1 = useRef(), g2 = useRef(), g3 = useRef(), g4 = useRef()
  useFrame(() => {
    const s = sepRef.current
    if (g2.current) g2.current.position.y = s * 0.9
    if (g3.current) g3.current.position.y = s * 1.8
    if (g4.current) g4.current.position.y = s * 3.0
  })
  const engines = [[0, -3.15, 0], ...ring(8, 0.62).map(([x, z]) => [x, -3.15, z])]
  return (
    <>
      <group ref={g1}>
        <Tube y={-3.1} h={6} r={0.95} />
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4
          return (
            <mesh key={i} position={[Math.cos(a) * 0.99, -1.6, Math.sin(a) * 0.99]} rotation={[0, -a, 0.06]}>
              <boxGeometry args={[0.09, 2.6, 0.32]} />
              <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.5} />
            </mesh>
          )
        })}
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
      <group ref={g2}>
        <Tube y={2.9} h={0.7} r={0.95} color={INTERSTAGE} />
      </group>
      <group ref={g3}>
        <Tube y={3.6} h={1.9} r={0.95} />
        <Engine position={[0, 3.45, 0]} scale={1.25} />
      </group>
      <group ref={g4}>
        <Tube y={5.5} h={1.2} r={0.98} />
        <Nose y={6.7} r={0.98} h={1.5} />
      </group>
    </>
  )
}

/* ---------- Starship + Super Heavy ---------- */

function Starship({ sepRef }) {
  const booster = useRef(), ship = useRef()
  useFrame(() => {
    const s = sepRef.current
    if (ship.current) ship.current.position.y = s * 2.4
  })
  const outer = ring(20, 1.05)
  const mid = ring(10, 0.62)
  const inner = ring(3, 0.24)
  const flap = (y, w, h, side) => (
    <mesh position={[side * 1.32, y, 0]} rotation={[0, 0, side * 0.08]}>
      <boxGeometry args={[0.5 * w, h, 0.08]} />
      <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.5} />
    </mesh>
  )
  return (
    <>
      <group ref={booster}>
        {/* Super Heavy */}
        <Tube y={-3.4} h={7.2} r={1.3} color={STEEL} />
        {/* grid fins */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4
          return (
            <mesh key={i} position={[Math.cos(a) * 1.42, 3.55, Math.sin(a) * 1.42]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.07, 0.6, 0.5]} />
              <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} />
            </mesh>
          )
        })}
        {/* hot-staging ring */}
        <Tube y={3.8} h={0.35} r={1.3} color={INTERSTAGE} />
        {[...inner, ...mid, ...outer].map(([x, z], i) => (
          <Engine key={i} position={[x, -3.5, z]} scale={0.45} color="#6f7580" />
        ))}
      </group>
      <group ref={ship}>
        {/* Ship */}
        <Tube y={4.15} h={4.4} r={1.3} color={STEEL} />
        <Nose y={8.55} r={1.3} h={2.2} color={STEEL} />
        {/* flaps */}
        {flap(5.0, 1.15, 2.0, 1)}
        {flap(5.0, 1.15, 2.0, -1)}
        {flap(9.2, 0.85, 1.4, 1)}
        {flap(9.2, 0.85, 1.4, -1)}
        {[...ring(3, 0.5), [0, 0]].slice(0, 6).map(([x, z], i) => (
          <Engine key={i} position={[x, 4.0, z]} scale={0.55} color="#6f7580" />
        ))}
      </group>
    </>
  )
}

/* ---------- Electron ---------- */

function Electron({ sepRef }) {
  const g1 = useRef(), g2 = useRef(), g3 = useRef()
  useFrame(() => {
    const s = sepRef.current
    if (g2.current) g2.current.position.y = s * 1.2
    if (g3.current) g3.current.position.y = s * 2.4
  })
  const engines = [[0, 0], ...ring(8, 0.28)]
  return (
    <group scale={1.6} position={[0, -1.4, 0]}>
      <group ref={g1}>
        <Tube y={-1.2} h={3.2} r={0.42} color={CARBON} />
        {engines.map(([x, z], i) => (
          <Engine key={i} position={[x, -1.28, z]} scale={0.28} color="#c8461e" />
        ))}
      </group>
      <group ref={g2}>
        <Tube y={2.0} h={1.1} r={0.42} color={CARBON} />
        <Engine position={[0, 1.95, 0]} scale={0.4} color="#c8461e" />
      </group>
      <group ref={g3}>
        <Tube y={3.1} h={0.5} r={0.44} color={HULL} />
        <Nose y={3.6} r={0.44} h={0.9} />
      </group>
    </group>
  )
}

const MODELS = {
  'falcon-9': { comp: Falcon9, label: 'Falcon 9', camY: 2 },
  starship: { comp: Starship, label: 'Starship', camY: 3 },
  electron: { comp: Electron, label: 'Electron', camY: 1.5 },
}

function Scene({ model, exploded, spinning }) {
  const ref = useRef()
  const sep = useRef(0)
  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += delta * 0.35
    const target = exploded ? 1 : 0
    sep.current += (target - sep.current) * Math.min(1, delta * 4)
  })
  const Model = MODELS[model].comp
  return (
    <group ref={ref} position={[0, -2.2, 0]}>
      <Model sepRef={sep} />
    </group>
  )
}

export default function RocketViewer() {
  const [model, setModel] = useState('starship')
  const [exploded, setExploded] = useState(false)
  const [spinning, setSpinning] = useState(true)

  return (
    <div>
      <div className="hangar-controls" style={{ marginTop: 0, marginBottom: 14 }}>
        {Object.entries(MODELS).map(([key, m]) => (
          <button key={key} className={`ctl-btn ${model === key ? 'on' : ''}`} onClick={() => setModel(key)}>
            {m.label}
          </button>
        ))}
      </div>
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
            <Scene model={model} exploded={exploded} spinning={spinning} />
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
        גרירה עם העכבר מסובבת את המודל, גלגלת מקרבת ומרחיקה. המודלים בנויים פרוצדורלית בפרופורציות אמיתיות; בשלב הבא
        נחליף אותם במודלי glTF מפורטים.
      </p>
    </div>
  )
}

import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import { VEHICLES } from './data/index.js'

// Data-driven 3D: every vehicle is generated from the same verified section
// list (meters) that powers the cutaway diagrams, so proportions are real.
// Detail passes: panel seam rings, cable raceways, engine bells per layout,
// SRBs, grid fins, flaps, landing legs and the Starship heat-shield shell.

const PALETTES = {
  starship: { hull: '#b9c2cd', tank: '#aeb7c3', dark: '#23272e', engine: '#79808a', accent: '#3c434d' },
  'falcon-9': { hull: '#e9eaee', tank: '#e9eaee', dark: '#272c36', engine: '#8a8f99', accent: '#1d2129' },
  'new-glenn': { hull: '#f0f1f3', tank: '#eceef0', dark: '#22262c', engine: '#858b94', accent: '#2b6bd8' },
  neutron: { hull: '#23262c', tank: '#2a2e35', dark: '#15181d', engine: '#9aa0a9', accent: '#cfd3d9' },
  electron: { hull: '#131519', tank: '#181b20', dark: '#0d0f13', engine: '#c8461e', accent: '#c8461e' },
  vulcan: { hull: '#edeef0', tank: '#e7e8ea', dark: '#40161d', engine: '#8a8f99', accent: '#7e2f2f' },
  sls: { hull: '#f0f0ee', tank: '#d97a45', dark: '#2c2e33', engine: '#8a8f99', accent: '#c96a35' },
  shavit: { hull: '#dfe2e6', tank: '#d6dade', dark: '#30343c', engine: '#8a8f99', accent: '#1f232b' },
}

const DEFAULT_PALETTE = { hull: '#e0e3e8', tank: '#d8dce2', dark: '#272b33', engine: '#8a8f99', accent: '#20242c' }

function ring(n, radius, phase = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = phase + (i / n) * Math.PI * 2
    return [Math.cos(a) * radius, Math.sin(a) * radius]
  })
}

const ENGINE_LAYOUTS = {
  single: () => [[0, 0, 1]],
  cluster2: () => ring(2, 0.45).map(([x, z]) => [x, z, 0.6]),
  cluster3: () => ring(3, 0.5).map(([x, z]) => [x, z, 0.5]),
  cluster4: () => ring(4, 0.52).map(([x, z]) => [x, z, 0.45]),
  cluster6: () => ring(6, 0.58).map(([x, z]) => [x, z, 0.38]),
  cluster7: () => [[0, 0, 0.38], ...ring(6, 0.58).map(([x, z]) => [x, z, 0.38])],
  octaweb: () => [[0, 0, 0.3], ...ring(8, 0.64).map(([x, z]) => [x, z, 0.3])],
  ring33: () => [
    ...ring(3, 0.14).map(([x, z]) => [x, z, 0.13]),
    ...ring(10, 0.42).map(([x, z]) => [x, z, 0.13]),
    ...ring(20, 0.76).map(([x, z]) => [x, z, 0.13]),
  ],
}

function Metal({ color, rough = 0.42, metal = 0.35, ...rest }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} {...rest} />
}

function EngineBell({ x, z, y, scale, color }) {
  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.34, 0.42, 0.18, 20]} />
        <Metal color="#585e68" metal={0.75} rough={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.42, 0.62, 0.55, 24, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.85} side={2} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.58, 0.5, 24, 1, true]} />
        <meshStandardMaterial color="#1a1410" roughness={0.6} side={1} />
      </mesh>
    </group>
  )
}

function buildStack(vehicle, pal) {
  // returns array of {key, y0, y1, midM, nodes} in normalized units
  const H = vehicle.dims.height_m
  const s = 9.5 / H
  const R = Math.max((vehicle.dims.diameter_m / 2) * s * 1.22, 0.26)
  const toY = (m) => m * s
  const stack = vehicle.sections.filter((x) => !x.overlay)
  const overlays = vehicle.sections.filter((x) => x.overlay)
  const items = []

  const seamRings = (y0, y1, r) => {
    const nodes = []
    const step = 2.8 * s
    for (let y = y0 + step; y < y1 - 0.05; y += step) {
      nodes.push(
        <mesh key={`seam${y.toFixed(2)}`} position={[0, y, 0]}>
          <cylinderGeometry args={[r * 1.006, r * 1.006, 0.015, 40, 1, true]} />
          <meshStandardMaterial color="#000000" opacity={0.22} transparent roughness={1} />
        </mesh>,
      )
    }
    return nodes
  }

  stack.forEach((sec, idx) => {
    const y0 = toY(sec.from_m)
    const y1 = toY(sec.to_m)
    const h = y1 - y0
    const mid = (y0 + y1) / 2
    const isTop = Math.abs(sec.to_m - H) < 0.02 * H
    const nodes = []

    if (sec.kind === 'engines') {
      nodes.push(
        <mesh key="body" position={[0, mid, 0]}>
          <cylinderGeometry args={[R, R, h, 44]} />
          <Metal color={pal.dark} rough={0.5} />
        </mesh>,
      )
      const layout = ENGINE_LAYOUTS[sec.engine?.layout] || (sec.engine?.count > 1 ? () => ring(Math.min(sec.engine.count, 12), 0.6).map(([x, z]) => [x, z, 0.35]) : ENGINE_LAYOUTS.single)
      for (const [ex, ez, esc] of layout()) {
        nodes.push(<EngineBell key={`e${ex}${ez}`} x={ex * R} z={ez * R} y={y0 + 0.05} scale={R * esc * 1.9} color={pal.engine} />)
      }
    } else if (isTop && ['fairing', 'nosecone', 'payload', 'capsule', 'escape_tower'].includes(sec.kind)) {
      if (sec.kind === 'escape_tower') {
        nodes.push(
          <mesh key="tower" position={[0, mid, 0]}>
            <cylinderGeometry args={[0.03, R * 0.3, h, 16]} />
            <Metal color={pal.dark} />
          </mesh>,
        )
      } else {
        const coneH = Math.min(h, R * 3)
        const cylH = h - coneH
        if (cylH > 0.02)
          nodes.push(
            <mesh key="fcyl" position={[0, y0 + cylH / 2, 0]}>
              <cylinderGeometry args={[R, R, cylH, 44]} />
              <Metal color={pal.hull} />
            </mesh>,
          )
        nodes.push(
          <mesh key="cone" position={[0, y0 + cylH + coneH * 0.42, 0]}>
            <cylinderGeometry args={[R * 0.3, R, coneH * 0.84, 44]} />
            <Metal color={pal.hull} />
          </mesh>,
          <mesh key="cap" position={[0, y0 + cylH + coneH * 0.84, 0]}>
            <sphereGeometry args={[R * 0.3, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Metal color={pal.hull} />
          </mesh>,
        )
      }
    } else if (sec.kind === 'capsule') {
      nodes.push(
        <mesh key="caps" position={[0, mid, 0]}>
          <cylinderGeometry args={[R * 0.45, R, h, 40]} />
          <Metal color={pal.hull} />
        </mesh>,
      )
    } else if (sec.kind === 'interstage' || sec.kind === 'thrust_structure' || sec.kind === 'avionics') {
      nodes.push(
        <mesh key="dark" position={[0, mid, 0]}>
          <cylinderGeometry args={[R, R, h, 44]} />
          <Metal color={pal.accent} rough={0.5} />
        </mesh>,
      )
    } else {
      const isTank = sec.kind.startsWith('tank')
      nodes.push(
        <mesh key="body" position={[0, mid, 0]}>
          <cylinderGeometry args={[R, R, h, 44]} />
          <Metal color={isTank ? pal.tank : pal.hull} />
        </mesh>,
        ...seamRings(y0, y1, R),
      )
      // cable raceway on taller sections
      if (h > 1.2) {
        nodes.push(
          <mesh key="raceway" position={[R * 0.99, mid, 0]}>
            <boxGeometry args={[R * 0.09, h * 0.96, R * 0.16]} />
            <Metal color={pal.dark} rough={0.55} />
          </mesh>,
        )
      }
    }

    items.push({ key: sec.id, idx, y0, y1, midM: (sec.from_m + sec.to_m) / 2, nodes })
  })

  // overlays attach to the stack section containing their midpoint
  for (const sec of overlays) {
    const y0 = toY(sec.from_m)
    const y1 = toY(sec.to_m)
    const h = y1 - y0
    const midM = (sec.from_m + sec.to_m) / 2
    const ownerItem =
      items.find((it, i) => {
        const st = stack[i]
        return midM >= st.from_m && midM <= st.to_m
      }) || items[0]
    const nodes = []

    if (sec.kind === 'gridfins') {
      for (const [i, [x, z]] of ring(4, R * 1.06, Math.PI / 4).entries()) {
        nodes.push(
          <mesh key={`gf${i}`} position={[x, (y0 + y1) / 2, z]} rotation={[0, -Math.atan2(z, x), 0]}>
            <boxGeometry args={[0.05, h * 0.85, R * 0.5]} />
            <Metal color={pal.dark} rough={0.45} metal={0.6} />
          </mesh>,
        )
      }
    } else if (sec.kind === 'flaps') {
      for (const side of [-1, 1]) {
        nodes.push(
          <mesh key={`fl${side}`} position={[side * R * 1.04, (y0 + y1) / 2, 0]} rotation={[0, 0, side * 0.1]}>
            <boxGeometry args={[R * 0.75, h * 0.92, 0.05]} />
            <Metal color={pal.dark} rough={0.5} />
          </mesh>,
        )
      }
    } else if (sec.kind === 'legs') {
      for (const [i, [x, z]] of ring(4, R * 0.99, Math.PI / 4).entries()) {
        const a = Math.atan2(z, x)
        nodes.push(
          <mesh key={`leg${i}`} position={[x * 1.1, (y0 + y1) / 2, z * 1.1]} rotation={[0, -a, 0.1]}>
            <boxGeometry args={[0.06, h, R * 0.22]} />
            <Metal color={pal.dark} rough={0.5} />
          </mesh>,
        )
      }
    } else if (sec.kind === 'strakes') {
      for (const side of [-1, 1]) {
        nodes.push(
          <mesh key={`st${side}`} position={[side * R * 1.05, (y0 + y1) / 2, 0]} rotation={[0, 0, side * -0.25]}>
            <boxGeometry args={[R * 0.4, h, 0.05]} />
            <Metal color={pal.dark} />
          </mesh>,
        )
      }
    } else if (sec.kind === 'srb') {
      const sr = Math.max(R * 0.45, 0.12)
      const bodyH = h - sr * 1.8
      for (const side of [-1, 1]) {
        const x = side * (R + sr + 0.04)
        nodes.push(
          <group key={`srb${side}`}>
            <mesh position={[x, y0 + bodyH / 2, 0]}>
              <cylinderGeometry args={[sr, sr, bodyH, 30]} />
              <Metal color={pal.hull} />
            </mesh>
            <mesh position={[x, y0 + bodyH + sr * 0.75, 0]}>
              <cylinderGeometry args={[sr * 0.1, sr, sr * 1.6, 30]} />
              <Metal color={pal.hull} />
            </mesh>
            <mesh position={[x, y0 - 0.12, 0]}>
              <cylinderGeometry args={[sr * 0.55, sr * 0.8, 0.28, 24, 1, true]} />
              <Metal color="#585e68" metal={0.8} rough={0.3} />
            </mesh>
          </group>,
        )
      }
    } else if (sec.kind === 'heatshield') {
      nodes.push(
        <mesh key="hs" position={[0, (y0 + y1) / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[R * 1.015, R * 1.015, h, 44, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#17181c" roughness={0.85} side={2} />
        </mesh>,
      )
    }

    if (nodes.length) ownerItem.nodes = [...ownerItem.nodes, ...nodes]
  }

  return items
}

function VehicleModel({ vehicle, sepRef }) {
  const pal = PALETTES[vehicle.slug] || DEFAULT_PALETTE
  const items = useMemo(() => buildStack(vehicle, pal), [vehicle])
  const refs = useRef([])

  useFrame(() => {
    const sep = sepRef.current
    items.forEach((it, i) => {
      const g = refs.current[i]
      if (g) g.position.y = sep * it.idx * 0.55
    })
  })

  return (
    <group>
      {items.map((it, i) => (
        <group key={it.key} ref={(el) => (refs.current[i] = el)}>
          {it.nodes}
        </group>
      ))}
    </group>
  )
}

function Scene({ vehicle, exploded, spinning }) {
  const ref = useRef()
  const sep = useRef(0)
  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += delta * 0.3
    const target = exploded ? 1 : 0
    sep.current += (target - sep.current) * Math.min(1, delta * 4)
  })
  return (
    <group ref={ref} position={[0, -4.6, 0]}>
      <VehicleModel vehicle={vehicle} sepRef={sep} />
      {/* pad ring */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 2.6, 48]} />
        <meshStandardMaterial color="#141a2c" roughness={0.9} />
      </mesh>
    </group>
  )
}

export default function RocketViewer() {
  const [slug, setSlug] = useState('starship')
  const [exploded, setExploded] = useState(false)
  const [spinning, setSpinning] = useState(true)
  const vehicle = VEHICLES.find((v) => v.slug === slug) || VEHICLES[0]

  return (
    <div>
      <div className="hangar-controls" style={{ marginTop: 0, marginBottom: 14 }}>
        {VEHICLES.map((v) => (
          <button key={v.slug} className={`ctl-btn ${slug === v.slug ? 'on' : ''}`} onClick={() => setSlug(v.slug)}>
            {v.name_en}
          </button>
        ))}
      </div>
      <div className="hangar-canvas">
        <Canvas camera={{ position: [10, 3.5, 10], fov: 42 }} shadows>
          <ambientLight intensity={0.4} />
          <directionalLight position={[7, 11, 5]} intensity={1.6} />
          <directionalLight position={[-7, 3, -5]} intensity={0.5} color="#7aa2ff" />
          <spotLight position={[0, 12, 0]} intensity={0.6} angle={0.5} penumbra={0.6} color="#cfe0ff" />
          <Suspense
            fallback={
              <Html center>
                <span style={{ color: '#7f90b6', fontFamily: 'monospace' }}>LOADING…</span>
              </Html>
            }
          >
            <Stars radius={60} depth={30} count={2600} factor={3} fade speed={0.5} />
            <Scene vehicle={vehicle} exploded={exploded} spinning={spinning} />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={4.5} maxDistance={24} target={[0, 0.6, 0]} />
        </Canvas>
      </div>
      <div className="hangar-controls">
        <button className={`ctl-btn ${exploded ? 'on' : ''}`} onClick={() => setExploded(!exploded)}>
          {exploded ? 'חיבור רכיבים' : 'פירוק לרכיבים'}
        </button>
        <button className={`ctl-btn ${spinning ? 'on' : ''}`} onClick={() => setSpinning(!spinning)}>
          {spinning ? 'עצירת סיבוב' : 'סיבוב אוטומטי'}
        </button>
      </div>
      <p className="hint">
        {vehicle.name_he} · {vehicle.dims.height_m} מטר · המודל נבנה אוטומטית מנתוני החתך המאומתים של הכלי, באותם ממדים
        אמיתיים. גרירה מסובבת, גלגלת מקרבת, ופירוק לרכיבים מציג כל חלק בנפרד.
      </p>
    </div>
  )
}

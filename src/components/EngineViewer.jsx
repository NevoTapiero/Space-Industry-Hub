// Interactive 3D engine: geometry is generated from the engine's cycle
// (pump count, preburners, gas generator, battery, solid casing), every
// part is clickable and explained with the engine's real data.

import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Vector2 } from 'three'
import { cycleById } from '../data/engines.js'

const M = {
  steel: { color: '#9aa3ae', metalness: 0.85, roughness: 0.32 },
  copper: { color: '#b46a4a', metalness: 0.9, roughness: 0.28 },
  dark: { color: '#2a2f38', metalness: 0.6, roughness: 0.5 },
  pipeF: { color: '#8a5a42', metalness: 0.8, roughness: 0.35 },
  pipeO: { color: '#5b7fae', metalness: 0.8, roughness: 0.35 },
  hot: { color: '#5c3a34', metalness: 0.7, roughness: 0.4 },
  green: { color: '#2e6f5c', metalness: 0.5, roughness: 0.45 },
  casing: { color: '#d8dce2', metalness: 0.3, roughness: 0.45 },
}

function Part({ id, selected, onSelect, mat, children, ...props }) {
  const sel = selected === id
  return (
    <group
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(sel ? null : id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {children(sel)}
    </group>
  )
}

function Mat({ base, sel }) {
  return <meshStandardMaterial {...base} emissive={sel ? '#3c62a8' : '#000000'} emissiveIntensity={sel ? 0.6 : 0} />
}

function bellPoints(throatR, exitR, len, n = 24) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push(new Vector2(throatR + (exitR - throatR) * Math.pow(t, 1.65), -t * len))
  }
  return pts
}

function EngineModel({ engine, selected, onSelect }) {
  const cycle = engine.cycle
  const isSolid = cycle === 'solid'
  const isElectric = cycle === 'electric-pump'
  const isPressureFed = cycle === 'pressure-fed' || cycle === 'cold-gas' || cycle === 'monoprop'
  const hasPumps = !isSolid && !isPressureFed
  const fullFlow = cycle === 'full-flow'
  const hasGG = cycle === 'gas-generator'
  const hasPB = cycle === 'staged-fuel-rich' || cycle === 'staged-ox-rich'
  const isExpander = cycle === 'expander'

  const bell = useMemo(() => bellPoints(0.16, isSolid ? 0.55 : 0.88, isSolid ? 1.0 : 1.7), [isSolid])
  const ribs = useMemo(() => {
    const arr = []
    for (let i = 1; i < 10; i++) {
      const t = i / 10
      arr.push({ y: -t * (isSolid ? 1.0 : 1.7), r: 0.16 + ((isSolid ? 0.55 : 0.88) - 0.16) * Math.pow(t, 1.65) })
    }
    return arr
  }, [isSolid])

  return (
    <group position={[0, 0.6, 0]}>
      {/* nozzle bell + cooling channels */}
      <Part id="nozzle" selected={selected} onSelect={onSelect}>
        {(sel) => (
          <group>
            <mesh>
              <latheGeometry args={[bell, 48]} />
              <meshStandardMaterial {...(isSolid ? M.dark : M.copper)} side={2} emissive={sel ? '#3c62a8' : '#000'} emissiveIntensity={sel ? 0.6 : 0} />
            </mesh>
            {!isSolid &&
              ribs.map((rb, i) => (
                <mesh key={i} position={[0, rb.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[rb.r + 0.012, 0.011, 8, 48]} />
                  <Mat base={M.steel} sel={sel} />
                </mesh>
              ))}
          </group>
        )}
      </Part>

      {/* combustion chamber + throat */}
      <Part id="chamber" selected={selected} onSelect={onSelect}>
        {(sel) => (
          <group>
            <mesh position={[0, 0.34, 0]}>
              <cylinderGeometry args={[isSolid ? 0.5 : 0.34, 0.16, 0.5, 40]} />
              <Mat base={isSolid ? M.casing : M.copper} sel={sel} />
            </mesh>
            {!isSolid && (
              <mesh position={[0, 0.75, 0]}>
                <cylinderGeometry args={[0.34, 0.34, 0.5, 40]} />
                <Mat base={M.copper} sel={sel} />
              </mesh>
            )}
          </group>
        )}
      </Part>

      {/* solid: propellant casing */}
      {isSolid && (
        <Part id="casing" selected={selected} onSelect={onSelect}>
          {(sel) => (
            <group>
              <mesh position={[0, 1.85, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 2.4, 40]} />
                <Mat base={M.casing} sel={sel} />
              </mesh>
              <mesh position={[0, 3.2, 0]}>
                <cylinderGeometry args={[0.16, 0.5, 0.5, 40]} />
                <Mat base={M.casing} sel={sel} />
              </mesh>
            </group>
          )}
        </Part>
      )}

      {/* injector + powerhead */}
      {!isSolid && (
        <Part id="injector" selected={selected} onSelect={onSelect}>
          {(sel) => (
            <mesh position={[0, 1.08, 0]}>
              <cylinderGeometry args={[0.37, 0.37, 0.18, 40]} />
              <Mat base={M.steel} sel={sel} />
            </mesh>
          )}
        </Part>
      )}

      {/* turbopumps */}
      {hasPumps &&
        (fullFlow || isElectric ? [-1, 1] : [0]).map((side, i) => (
          <Part key={i} id={side <= 0 ? 'pump-fuel' : 'pump-ox'} selected={selected} onSelect={onSelect}>
            {(sel) => (
              <group position={[side === 0 ? 0.58 : side * 0.58, 1.45, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.19, 0.19, 0.62, 28]} />
                  <Mat base={M.steel} sel={sel} />
                </mesh>
                <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.24, 0.07, 12, 28]} />
                  <Mat base={M.steel} sel={sel} />
                </mesh>
              </group>
            )}
          </Part>
        ))}

      {/* preburners / gas generator / battery */}
      {(hasPB || fullFlow) &&
        (fullFlow ? [-1, 1] : [0.0]).map((side, i) => (
          <Part key={i} id={fullFlow ? (side < 0 ? 'preburner-fuel' : 'preburner-ox') : 'preburner'} selected={selected} onSelect={onSelect}>
            {(sel) => (
              <mesh position={[fullFlow ? side * 0.58 : 0.58, 1.98, 0]}>
                <sphereGeometry args={[0.2, 24, 18]} />
                <Mat base={M.hot} sel={sel} />
              </mesh>
            )}
          </Part>
        ))}
      {hasGG && (
        <Part id="gasgen" selected={selected} onSelect={onSelect}>
          {(sel) => (
            <group>
              <mesh position={[0.58, 1.98, 0]}>
                <sphereGeometry args={[0.18, 24, 18]} />
                <Mat base={M.hot} sel={sel} />
              </mesh>
              <mesh position={[0.82, 0.9, 0]} rotation={[0, 0, -0.25]}>
                <cylinderGeometry args={[0.06, 0.09, 1.9, 16]} />
                <Mat base={M.dark} sel={sel} />
              </mesh>
            </group>
          )}
        </Part>
      )}
      {isElectric && (
        <Part id="battery" selected={selected} onSelect={onSelect}>
          {(sel) => (
            <mesh position={[0, 2.0, -0.45]}>
              <boxGeometry args={[0.7, 0.34, 0.26]} />
              <Mat base={M.green} sel={sel} />
            </mesh>
          )}
        </Part>
      )}

      {/* feedlines */}
      {!isSolid && (
        <Part id="feedlines" selected={selected} onSelect={onSelect}>
          {(sel) => (
            <group>
              <mesh position={[-0.35, 1.55, 0.18]} rotation={[0, 0, 0.5]}>
                <torusGeometry args={[0.42, 0.045, 10, 32, Math.PI * 0.9]} />
                <Mat base={M.pipeF} sel={sel} />
              </mesh>
              <mesh position={[0.35, 1.55, -0.18]} rotation={[Math.PI, 0, 0.5]}>
                <torusGeometry args={[0.42, 0.045, 10, 32, Math.PI * 0.9]} />
                <Mat base={M.pipeO} sel={sel} />
              </mesh>
              <mesh position={[0, 2.3, 0.1]} rotation={[0.3, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
                <Mat base={M.pipeO} sel={sel} />
              </mesh>
            </group>
          )}
        </Part>
      )}

      {/* gimbal mount */}
      <Part id="gimbal" selected={selected} onSelect={onSelect}>
        {(sel) => (
          <group position={[0, isSolid ? 3.55 : 2.55, 0]}>
            <mesh>
              <sphereGeometry args={[0.14, 20, 16]} />
              <Mat base={M.dark} sel={sel} />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.3, 0.18, 0.14, 24]} />
              <Mat base={M.dark} sel={sel} />
            </mesh>
          </group>
        )}
      </Part>
    </group>
  )
}

function Spin({ spinning, children }) {
  const ref = useRef()
  useFrame((_, d) => {
    if (spinning && ref.current) ref.current.rotation.y += d * 0.35
  })
  return <group ref={ref}>{children}</group>
}

export const ENGINE_PARTS_HE = {
  nozzle: {
    name_he: 'חרירית (Nozzle)',
    text: (e) =>
      `הפעמון שממיר לחץ וחום למהירות: הגזים מואצים בו מכמה מאות מטרים לשנייה למעל 3 ק"מ לשנייה. הטבעות לאורך הפעמון הן תעלות הקירור. ${e.cooling_he}`,
  },
  chamber: {
    name_he: 'תא בעירה',
    text: (e) =>
      `כאן הדלק והמחמצן נפגשים ובוערים. הלחץ בתא: ${e.pc_bar ? `${e.pc_bar} בר, בערך פי ${Math.round(e.pc_bar / 1.01)} מהלחץ האטמוספרי` : 'לא פורסם רשמית'}. חומרים: ${e.materials_he}`,
  },
  injector: {
    name_he: 'ראש הזרקה',
    text: () =>
      'הצלחת המחוררת שמעל התא: מאות פתחים זעירים שמערבבים את הדלק והמחמצן לערפל אחיד. עיצוב גרוע כאן גורם לרעידות בעירה שיכולות לפרק מנוע במילישניות.',
  },
  'pump-fuel': { name_he: 'משאבת דלק', text: (e) => `דוחסת את ${e.fuel_he} ללחץ גבוה מלחץ התא. מסתובבת עשרות אלפי סיבובים בדקה.` },
  'pump-ox': { name_he: 'משאבת מחמצן', text: (e) => `דוחסת את ${e.ox_he}. הצד המסוכן של המנוע: חמצן בלחץ גבוה מתלקח כמעט מכל דבר.` },
  preburner: {
    name_he: 'מבער מקדים',
    text: (e) => `שורף חלק מהדלק כדי להניע את הטורבינה, והגזים ממשיכים לתא הראשי. ${cycleById(e.cycle)?.desc_he || ''}`,
  },
  'preburner-fuel': { name_he: 'מבער מקדים עשיר דלק', text: () => 'שורף את כל הדלק עם מעט חמצן. הגז העשיר בדלק מניע את משאבת הדלק וממשיך לתא הראשי.' },
  'preburner-ox': { name_he: 'מבער מקדים עשיר חמצן', text: () => 'שורף את כל החמצן עם מעט דלק. גז חמצני חם הוא סביבה אכזרית, ולכן נדרשות סגסוגות מיוחדות.' },
  gasgen: { name_he: 'מחולל גז + צינור פליטה', text: () => 'שורף כ-3% מהדלק רק כדי לסובב את הטורבינה, והגזים נזרקים דרך הצינור הכהה בצד. המחיר של הפשטות.' },
  battery: { name_he: 'חבילת סוללות', text: () => 'סוללות ליתיום שמניעות את משאבות הדלק במקום טורבינת גז. פשוט, מדויק, וכבד.' },
  feedlines: { name_he: 'צנרת הזנה', text: (e) => `הצינורות שמובילים את ${e.fuel_he} (כתום) ואת ${e.ox_he} (כחול) בין המשאבות, הראש והחרירית.` },
  gimbal: { name_he: 'מפרק היגוי (Gimbal)', text: () => 'המפרק שמחבר את המנוע לטיל ומאפשר להטות אותו כמה מעלות לכל כיוון. כך הטיל שומר על כיוון: מטים את הדחף, לא הגאים.' },
  casing: { name_he: 'מעטפת הדלק המוצק', text: (e) => `${e.fuel_he} יצוק בתוך המעטפת עם תעלה כוכבית במרכז. שטח הבעירה קובע את עקומת הדחף, ואי אפשר לכבות.` },
}

export default function EngineViewer({ engine, selected, onSelect }) {
  const [spinning, setSpinning] = useState(true)
  return (
    <div>
      <div className="hangar-canvas" style={{ height: 460 }}>
        <Canvas camera={{ position: [3.6, 2.2, 3.6], fov: 40 }}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[5, 7, 4]} intensity={1.7} />
          <directionalLight position={[-5, 2, -4]} intensity={0.5} color="#7aa2ff" />
          <spotLight position={[0, 8, 0]} intensity={0.7} angle={0.5} penumbra={0.7} color="#cfe0ff" />
          <Suspense fallback={<Html center><span style={{ color: '#7f90b6', fontFamily: 'monospace' }}>LOADING…</span></Html>}>
            <Spin spinning={spinning}>
              <group position={[0, -1.7, 0]}>
                <EngineModel engine={engine} selected={selected} onSelect={onSelect} />
              </group>
            </Spin>
          </Suspense>
          <OrbitControls enablePan={false} minDistance={2.2} maxDistance={9} target={[0, 0.2, 0]} />
        </Canvas>
      </div>
      <div className="hangar-controls">
        <button className={`ctl-btn ${spinning ? 'on' : ''}`} onClick={() => setSpinning(!spinning)}>
          {spinning ? 'עצירת סיבוב' : 'סיבוב אוטומטי'}
        </button>
      </div>
    </div>
  )
}

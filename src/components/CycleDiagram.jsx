// Schematic flow diagram per propulsion cycle. Colors: fuel = ember,
// oxidizer = telemetry blue, hot gas = red, electric = green.

const C = { fuel: '#ff9a5c', ox: '#6ea8ff', hot: '#ff5d73', elec: '#35d49a', metal: '#aebdde' }

function Tank({ x, y, color, label }) {
  return (
    <g>
      <rect x={x - 26} y={y - 16} width={52} height={32} rx={9} fill={`${color}18`} stroke={color} strokeWidth="1.4" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={color} fontFamily="Heebo">{label}</text>
    </g>
  )
}

function Pump({ x, y, label = 'משאבה', side = 1 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={13} fill="#10182f" stroke={C.metal} strokeWidth="1.6" />
      <path d={`M ${x - 5} ${y + 5} L ${x} ${y - 6} L ${x + 5} ${y + 5}`} fill="none" stroke={C.metal} strokeWidth="1.6" />
      <text x={x + side * 18} y={y + 3.5} textAnchor={side === 1 ? 'start' : 'end'} fontSize="8.5" fill="#93a3c4" fontFamily="Heebo">{label}</text>
    </g>
  )
}

function Turbine({ x, y, label = 'טורבינה', labelDy = 0, side = 1 }) {
  return (
    <g>
      <rect x={x - 11} y={y - 11} width={22} height={22} rx={4} fill="#10182f" stroke={C.hot} strokeWidth="1.6" />
      <path d={`M ${x - 5} ${y - 5} L ${x + 5} ${y + 5} M ${x + 5} ${y - 5} L ${x - 5} ${y + 5}`} stroke={C.hot} strokeWidth="1.4" />
      <text x={x + side * 16} y={y + 3.5 + labelDy} textAnchor={side === 1 ? 'start' : 'end'} fontSize="8.5" fill="#93a3c4" fontFamily="Heebo">{label}</text>
    </g>
  )
}

function Burner({ x, y, label, color }) {
  return (
    <g>
      <rect x={x - 22} y={y - 12} width={44} height={24} rx={6} fill={`${color}20`} stroke={color} strokeWidth="1.4" />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize="8.5" fill={color} fontFamily="Heebo">{label}</text>
    </g>
  )
}

function Battery({ x, y }) {
  return (
    <g>
      <rect x={x - 16} y={y - 10} width={32} height={20} rx={4} fill="#0e2a22" stroke={C.elec} strokeWidth="1.4" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill={C.elec} fontFamily="monospace">⚡</text>
    </g>
  )
}

function Chamber({ x = 160, y = 168, solid = false }) {
  return (
    <g>
      <path
        d={`M ${x - 14} ${y} L ${x - 14} ${y + 18} L ${x - 26} ${y + 44} L ${x + 26} ${y + 44} L ${x + 14} ${y + 18} L ${x + 14} ${y} Z`}
        fill="rgba(255,93,115,0.12)"
        stroke={C.hot}
        strokeWidth="1.5"
      />
      {solid && <rect x={x - 12} y={y - 40} width={24} height={38} fill="rgba(255,154,92,0.25)" stroke={C.fuel} strokeWidth="1.3" />}
      <path d={`M ${x - 9} ${y + 46} Q ${x} ${y + 62} ${x + 9} ${y + 46}`} fill="none" stroke={C.hot} strokeWidth="1.2" opacity="0.7" />
    </g>
  )
}

const MARKER_ID = { [C.fuel]: 'arr-fuel', [C.ox]: 'arr-ox', [C.hot]: 'arr-hot', [C.elec]: 'arr-elec', [C.metal]: 'arr-metal' }

function Line({ d, color, dashed }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeDasharray={dashed ? '4 3' : 'none'}
      markerEnd={`url(#${MARKER_ID[color] || 'arr-metal'})`}
      opacity="0.92"
      strokeLinecap="round"
    />
  )
}

function ArrowDefs() {
  return (
    <defs>
      {Object.entries(MARKER_ID).map(([color, id]) => (
        <marker key={id} id={id} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={color} />
        </marker>
      ))}
    </defs>
  )
}

const FT = [70, 34]
const OT = [250, 34]
const CH = [160, 168]

const LAYOUTS = {
  'cold-gas': () => (
    <>
      <Tank x={160} y={40} color={C.ox} label="גז דחוס" />
      <rect x={152} y={104} width={16} height={14} rx={3} fill="#10182f" stroke={C.metal} strokeWidth="1.3" />
      <Line d={`M 160 56 L 160 104`} color={C.ox} />
      <Line d={`M 160 118 L 160 168`} color={C.ox} />
      <Chamber />
    </>
  ),
  monoprop: () => (
    <>
      <Tank x={160} y={40} color={C.fuel} label="הידרזין" />
      <rect x={140} y={100} width={40} height={18} rx={4} fill="rgba(53,212,154,0.12)" stroke={C.elec} strokeWidth="1.3" />
      <text x={160} y={112.5} textAnchor="middle" fontSize="8.5" fill={C.elec} fontFamily="Heebo">קטליזטור</text>
      <Line d={`M 160 56 L 160 100`} color={C.fuel} />
      <Line d={`M 160 118 L 160 168`} color={C.hot} />
      <Chamber />
    </>
  ),
  'pressure-fed': () => (
    <>
      <Tank x={160} y={18} color={C.elec} label="הליום" />
      <Tank x={FT[0]} y={64} color={C.fuel} label="דלק" />
      <Tank x={OT[0]} y={64} color={C.ox} label="מחמצן" />
      <Line d={`M 140 22 L 70 22 L 70 48`} color={C.elec} dashed />
      <Line d={`M 180 22 L 250 22 L 250 48`} color={C.elec} dashed />
      <Line d={`M 70 80 L 70 130 L 146 162`} color={C.fuel} />
      <Line d={`M 250 80 L 250 130 L 174 162`} color={C.ox} />
      <Chamber />
    </>
  ),
  'electric-pump': () => (
    <>
      <Tank x={FT[0]} y={FT[1]} color={C.fuel} label="דלק" />
      <Tank x={OT[0]} y={OT[1]} color={C.ox} label="מחמצן" />
      <Battery x={160} y={84} />
      <Pump x={FT[0]} y={110} />
      <Pump x={OT[0]} y={110} />
      <Line d={`M 144 84 L 83 104`} color={C.elec} dashed />
      <Line d={`M 176 84 L 237 104`} color={C.elec} dashed />
      <Line d={`M 70 50 L 70 97`} color={C.fuel} />
      <Line d={`M 250 50 L 250 97`} color={C.ox} />
      <Line d={`M 70 123 L 70 150 L 146 166`} color={C.fuel} />
      <Line d={`M 250 123 L 250 150 L 174 166`} color={C.ox} />
      <Chamber />
    </>
  ),
  'gas-generator': () => (
    <>
      <Tank x={FT[0]} y={FT[1]} color={C.fuel} label="דלק" />
      <Tank x={OT[0]} y={OT[1]} color={C.ox} label="מחמצן" />
      <Pump x={FT[0]} y={100} />
      <Pump x={OT[0]} y={100} />
      <Burner x={160} y={78} label="מחולל גז" color={C.hot} />
      <Turbine x={160} y={116} />
      <Line d={`M 70 50 L 70 87`} color={C.fuel} />
      <Line d={`M 250 50 L 250 87`} color={C.ox} />
      <Line d={`M 83 92 L 138 82`} color={C.fuel} />
      <Line d={`M 237 92 L 182 82`} color={C.ox} />
      <Line d={`M 160 90 L 160 105`} color={C.hot} />
      <Line d={`M 171 122 L 205 140 L 205 176`} color={C.hot} dashed />
      <text x={222} y={186} fontSize="8" fill="#7f90b6" fontFamily="Heebo">פליטה החוצה</text>
      <Line d={`M 70 113 L 70 150 L 146 166`} color={C.fuel} />
      <Line d={`M 250 113 L 250 150 L 174 166`} color={C.ox} />
      <Chamber />
    </>
  ),
  'staged-fuel-rich': () => (
    <>
      <Tank x={FT[0]} y={FT[1]} color={C.fuel} label="דלק" />
      <Tank x={OT[0]} y={OT[1]} color={C.ox} label="מחמצן" />
      <Burner x={135} y={80} label="מבער מקדים" color={C.fuel} />
      <Turbine x={135} y={114} />
      <Pump x={70} y={104} />
      <Pump x={250} y={104} />
      <Line d={`M 70 50 L 70 91`} color={C.fuel} />
      <Line d={`M 70 66 L 113 74`} color={C.fuel} />
      <Line d={`M 250 50 L 250 91`} color={C.ox} />
      <Line d={`M 250 66 L 157 74`} color={C.ox} dashed />
      <Line d={`M 135 92 L 135 103`} color={C.hot} />
      <Line d={`M 135 125 L 150 168`} color={C.hot} />
      <Line d={`M 83 108 L 124 112`} color={C.metal} dashed />
      <Line d={`M 237 108 L 146 116`} color={C.metal} dashed />
      <Line d={`M 250 117 L 250 150 L 174 164`} color={C.ox} />
      <Chamber />
    </>
  ),
  'staged-ox-rich': () => (
    <>
      <Tank x={FT[0]} y={FT[1]} color={C.fuel} label="דלק" />
      <Tank x={OT[0]} y={OT[1]} color={C.ox} label="מחמצן" />
      <Burner x={185} y={80} label="מבער מקדים" color={C.ox} />
      <Turbine x={185} y={114} />
      <Pump x={70} y={104} />
      <Pump x={250} y={104} />
      <Line d={`M 250 50 L 250 91`} color={C.ox} />
      <Line d={`M 250 66 L 207 74`} color={C.ox} />
      <Line d={`M 70 50 L 70 91`} color={C.fuel} />
      <Line d={`M 70 66 L 163 74`} color={C.fuel} dashed />
      <Line d={`M 185 92 L 185 103`} color={C.hot} />
      <Line d={`M 185 125 L 170 168`} color={C.hot} />
      <Line d={`M 83 108 L 174 112`} color={C.metal} dashed />
      <Line d={`M 237 108 L 196 112`} color={C.metal} dashed />
      <Line d={`M 70 117 L 70 150 L 146 164`} color={C.fuel} />
      <Chamber />
    </>
  ),
  'full-flow': () => (
    <>
      <Tank x={FT[0]} y={FT[1]} color={C.fuel} label="דלק" />
      <Tank x={OT[0]} y={OT[1]} color={C.ox} label="מחמצן" />
      <Burner x={90} y={80} label="מבער דלק" color={C.fuel} />
      <Burner x={230} y={80} label="מבער חמצן" color={C.ox} />
      <Turbine x={90} y={114} />
      <Turbine x={230} y={114} />
      <Pump x={55} y={140} />
      <Pump x={265} y={140} />
      <Line d={`M 70 50 L 90 68`} color={C.fuel} />
      <Line d={`M 250 50 L 262 68 L 244 72`} color={C.ox} dashed />
      <Line d={`M 250 50 L 230 68`} color={C.ox} />
      <Line d={`M 70 50 L 58 68 L 76 72`} color={C.fuel} dashed />
      <Line d={`M 90 92 L 90 103`} color={C.hot} />
      <Line d={`M 230 92 L 230 103`} color={C.hot} />
      <Line d={`M 90 125 L 150 164`} color={C.hot} />
      <Line d={`M 230 125 L 170 164`} color={C.hot} />
      <Line d={`M 79 118 L 62 129`} color={C.metal} dashed />
      <Line d={`M 241 118 L 258 129`} color={C.metal} dashed />
      <Chamber />
    </>
  ),
  expander: () => (
    <>
      <Tank x={FT[0]} y={FT[1]} color={C.fuel} label="מימן" />
      <Tank x={OT[0]} y={OT[1]} color={C.ox} label="חמצן" />
      <Pump x={70} y={100} />
      <Pump x={250} y={100} />
      <Turbine x={160} y={96} />
      <Line d={`M 70 50 L 70 87`} color={C.fuel} />
      <Line d={`M 250 50 L 250 87`} color={C.ox} />
      <Line d={`M 70 113 L 70 140 L 128 196 L 133 200`} color={C.fuel} />
      <path d={`M 133 200 Q 160 216 187 200`} fill="none" stroke={C.fuel} strokeWidth="1.6" strokeDasharray="2 2" />
      <text x={160} y={228} textAnchor="middle" fontSize="8" fill="#7f90b6" fontFamily="Heebo">הדלק מתחמם בדפנות החרירית</text>
      <Line d={`M 187 200 L 196 150 L 168 104`} color={C.fuel} dashed />
      <Line d={`M 160 107 L 160 130 L 152 164`} color={C.fuel} />
      <Line d={`M 149 96 L 83 98`} color={C.metal} dashed />
      <Line d={`M 250 113 L 250 150 L 174 164`} color={C.ox} />
      <Chamber />
    </>
  ),
  solid: () => (
    <>
      <text x={160} y={30} textAnchor="middle" fontSize="9.5" fill="#aebdde" fontFamily="Heebo">דלק ומחמצן יצוקים יחד במעטפת</text>
      <rect x={136} y={44} width={48} height={120} rx={10} fill="rgba(255,154,92,0.14)" stroke={C.fuel} strokeWidth="1.5" />
      <path d={`M 160 54 L 154 74 L 166 94 L 154 114 L 166 134 L 160 154`} fill="none" stroke={C.hot} strokeWidth="1.5" />
      <Chamber x={160} y={168} />
    </>
  ),
}

export default function CycleDiagram({ cycleId }) {
  const Layout = LAYOUTS[cycleId]
  if (!Layout) return null
  return (
    <svg viewBox="0 0 320 240" className="cycle-svg" role="img">
      <ArrowDefs />
      <Layout />
      {/* legend */}
      <g fontFamily="Heebo" fontSize="8.5">
        <circle cx={14} cy={228} r={3.5} fill={C.fuel} />
        <text x={22} y={231} fill="#7f90b6">דלק</text>
        <circle cx={52} cy={228} r={3.5} fill={C.ox} />
        <text x={60} y={231} fill="#7f90b6">מחמצן</text>
        <circle cx={98} cy={228} r={3.5} fill={C.hot} />
        <text x={106} y={231} fill="#7f90b6">גז חם</text>
      </g>
    </svg>
  )
}

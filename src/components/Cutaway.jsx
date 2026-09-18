// Interactive to-scale cutaway schematic. Renders a vehicle's section list
// (meters, bottom-to-top) as a blueprint-style side view: every part is
// clickable, with engineering-drawing leader lines out to the margins.
// Sections may carry their own diameter_m (wide fairings, narrow upper stages).

const VB_W = 560
const DRAW_H = 560
const TOP_PAD = 34
const BOT_PAD = 46
const CX = VB_W / 2

function noseShape(cx, r, yTop, yBottom, curveFrac = 0.75) {
  const curveH = Math.min((yBottom - yTop) * curveFrac, r * 2.6)
  const yC = yTop + curveH
  return `M ${cx - r} ${yBottom} L ${cx - r} ${yC} Q ${cx - r} ${yTop} ${cx} ${yTop} Q ${cx + r} ${yTop} ${cx + r} ${yC} L ${cx + r} ${yBottom} Z`
}

function capsuleShape(cx, r, yTop, yBottom) {
  const topR = r * 0.42
  return `M ${cx - r} ${yBottom} L ${cx - topR} ${yTop + 3} Q ${cx - topR} ${yTop} ${cx - topR + 2} ${yTop} L ${cx + topR - 2} ${yTop} Q ${cx + topR} ${yTop} ${cx + topR} ${yTop + 3} L ${cx + r} ${yBottom} Z`
}

export default function Cutaway({ vehicle, selectedId, onSelect }) {
  const { dims, sections } = vehicle
  const H = dims.height_m
  const s = DRAW_H / H
  const coreR = Math.max((dims.diameter_m / 2) * s, 7)
  const rOf = (sec) => Math.max(((sec.diameter_m ?? dims.diameter_m) / 2) * s, 5)
  const y = (m) => TOP_PAD + (H - m) * s
  const baseline = y(0)

  const stack = sections.filter((x) => !x.overlay)
  const overlays = sections.filter((x) => x.overlay)

  // radius of the stack section that contains a given height (for overlay offsets)
  const rAt = (m) => {
    const sec = stack.find((x) => m >= x.from_m && m <= x.to_m)
    return sec ? rOf(sec) : coreR
  }

  // ----- shapes -----
  const shapes = []

  stack.forEach((sec, i) => {
    const r = rOf(sec)
    const y0 = y(sec.to_m)
    const y1 = y(sec.from_m)
    const isTop = Math.abs(sec.to_m - H) < 0.02 * H
    // radius of the section below, for smooth width transitions
    const below = i > 0 ? rOf(stack[i - 1]) : r
    let el
    if (isTop && ['fairing', 'nosecone', 'payload', 'capsule', 'escape_tower'].includes(sec.kind)) {
      if (sec.kind === 'capsule') el = <path className="shape" d={capsuleShape(CX, r, y0, y1)} />
      else if (sec.kind === 'escape_tower')
        el = <path className="shape" d={`M ${CX - r * 0.28} ${y1} L ${CX - r * 0.28} ${y0 + (y1 - y0) * 0.3} L ${CX} ${y0} L ${CX + r * 0.28} ${y0 + (y1 - y0) * 0.3} L ${CX + r * 0.28} ${y1} Z`} />
      else el = <path className="shape" d={noseShape(CX, r, y0, y1)} />
    } else if (sec.kind === 'capsule') {
      el = <path className="shape" d={capsuleShape(CX, r, y0, y1)} />
    } else if (sec.kind === 'engines' || sec.kind === 'thrust_structure') {
      const n = Math.min(sec.engine?.count || 3, 5)
      const bells = []
      const bw = (r * 2) / (n + 1)
      for (let j = 0; j < n; j++) {
        const bx = CX - r + bw * (j + 1)
        bells.push(
          <path
            key={j}
            className="shape"
            d={`M ${bx - bw * 0.26} ${y1 - 1} L ${bx - bw * 0.4} ${y1 + 9} L ${bx + bw * 0.4} ${y1 + 9} L ${bx + bw * 0.26} ${y1 - 1} Z`}
          />,
        )
      }
      el = (
        <>
          <rect className="shape" x={CX - r} y={y0} width={r * 2} height={y1 - y0} />
          {sec.kind === 'engines' && bells}
        </>
      )
    } else if (sec.kind === 'interstage') {
      // taper when widths differ (e.g. LVSA on SLS)
      const el2 =
        Math.abs(below - r) > 1 ? (
          <path className="shape" d={`M ${CX - below} ${y1} L ${CX - r} ${y0} L ${CX + r} ${y0} L ${CX + below} ${y1} Z`} />
        ) : (
          <rect className="shape" x={CX - r} y={y0} width={r * 2} height={y1 - y0} />
        )
      el = (
        <>
          {el2}
          <line x1={CX - r} y1={(y0 + y1) / 2} x2={CX + r} y2={(y0 + y1) / 2} stroke="rgba(148,175,230,0.35)" strokeDasharray="3 3" strokeWidth="1" />
        </>
      )
    } else if (Math.abs(below - r) > 1) {
      // width change without an interstage: draw with a short taper at the base
      const taperH = Math.min((y1 - y0) * 0.25, 14)
      el = (
        <path
          className="shape"
          d={`M ${CX - below} ${y1} L ${CX - r} ${y1 - taperH} L ${CX - r} ${y0} L ${CX + r} ${y0} L ${CX + r} ${y1 - taperH} L ${CX + below} ${y1} Z`}
        />
      )
    } else {
      el = <rect className="shape" x={CX - r} y={y0} width={r * 2} height={y1 - y0} />
    }
    shapes.push({ sec, el, edgeX: r, midY: (y0 + y1) / 2 })
  })

  for (const sec of overlays) {
    const y0 = y(sec.to_m)
    const y1 = y(sec.from_m)
    const h = y1 - y0
    const r = rAt((sec.from_m + sec.to_m) / 2)
    let el = null
    let edgeX = r
    if (sec.kind === 'gridfins') {
      edgeX = r + 6
      el = (
        <>
          <rect className="shape" x={CX - r - 6} y={y0} width={6} height={h} />
          <rect className="shape" x={CX + r} y={y0} width={6} height={h} />
        </>
      )
    } else if (sec.kind === 'flaps') {
      edgeX = r + Math.max(7, r * 0.55)
      const fw = edgeX - r
      el = (
        <>
          <path className="shape" d={`M ${CX - r} ${y0} L ${CX - r - fw} ${y0 + h * 0.18} L ${CX - r - fw} ${y1 - h * 0.1} L ${CX - r} ${y1} Z`} />
          <path className="shape" d={`M ${CX + r} ${y0} L ${CX + r + fw} ${y0 + h * 0.18} L ${CX + r + fw} ${y1 - h * 0.1} L ${CX + r} ${y1} Z`} />
        </>
      )
    } else if (sec.kind === 'legs') {
      edgeX = r + 10
      el = (
        <>
          <path className="shape" d={`M ${CX - r} ${y0} L ${CX - r - 10} ${y1 + 2} L ${CX - r - 6} ${y1 + 2} L ${CX - r + 2} ${y0 + 4} Z`} />
          <path className="shape" d={`M ${CX + r} ${y0} L ${CX + r + 10} ${y1 + 2} L ${CX + r + 6} ${y1 + 2} L ${CX + r - 2} ${y0 + 4} Z`} />
        </>
      )
    } else if (sec.kind === 'strakes') {
      edgeX = r + 8
      el = (
        <>
          <path className="shape" d={`M ${CX - r} ${y0} L ${CX - r - 8} ${y1} L ${CX - r} ${y1} Z`} />
          <path className="shape" d={`M ${CX + r} ${y0} L ${CX + r + 8} ${y1} L ${CX + r} ${y1} Z`} />
        </>
      )
    } else if (sec.kind === 'srb') {
      const sr = Math.max(r * 0.45, 5)
      const gap = 3
      edgeX = r + gap + sr * 2
      const srbBody = (x) => (
        <>
          <rect className="shape" x={x} y={y0 + sr * 1.6} width={sr * 2} height={h - sr * 1.6} />
          <path className="shape" d={`M ${x} ${y0 + sr * 1.6} L ${x + sr * 0.3} ${y0} L ${x + sr * 1.7} ${y0} L ${x + sr * 2} ${y0 + sr * 1.6} Z`} />
        </>
      )
      el = (
        <>
          <g>{srbBody(CX - r - gap - sr * 2)}</g>
          <g>{srbBody(CX + r + gap)}</g>
        </>
      )
    } else if (sec.kind === 'heatshield') {
      edgeX = r + 3
      el = <line x1={CX - r - 2} y1={y0} x2={CX - r - 2} y2={y1} stroke="#ff9a5c" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
    } else {
      edgeX = r + 5
      el = <rect className="shape" x={CX + r} y={y0} width={5} height={h} />
    }
    shapes.push({ sec, el, edgeX, midY: (y0 + y1) / 2, overlay: true })
  }

  // ----- labels: alternate sides, resolve vertical collisions per side -----
  const maxEdge = Math.max(...shapes.map((sh) => sh.edgeX))
  const ordered = [...shapes].sort((a, b) => a.midY - b.midY)
  const sides = { left: [], right: [] }
  ordered.forEach((sh, i) => {
    const side = i % 2 === 0 ? 'right' : 'left'
    sides[side].push({ ...sh, labelY: sh.midY })
  })
  for (const side of ['left', 'right']) {
    const arr = sides[side]
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].labelY - arr[i - 1].labelY < 20) arr[i].labelY = arr[i - 1].labelY + 20
    }
    const overshoot = arr.length ? arr[arr.length - 1].labelY - (TOP_PAD + DRAW_H + 8) : 0
    if (overshoot > 0) for (const l of arr) l.labelY -= overshoot
  }
  const labels = [...sides.left.map((l) => ({ ...l, side: 'left' })), ...sides.right.map((l) => ({ ...l, side: 'right' }))]

  return (
    <svg
      className="cutaway-svg"
      viewBox={`0 0 ${VB_W} ${TOP_PAD + DRAW_H + BOT_PAD}`}
      role="img"
      aria-label={`דיאגרמת חתך של ${vehicle.name_he}`}
    >
      {/* ground + dimension line */}
      <line x1={CX - maxEdge - 26} y1={baseline + 12} x2={CX + maxEdge + 26} y2={baseline + 12} stroke="rgba(148,175,230,0.3)" strokeWidth="1" />
      <line className="cut-dim" x1={30} y1={y(H)} x2={30} y2={baseline} />
      <line className="cut-dim" x1={24} y1={y(H)} x2={44} y2={y(H)} />
      <line className="cut-dim" x1={24} y1={baseline} x2={44} y2={baseline} />
      <text className="cut-dim-text" x={18} y={(y(H) + baseline) / 2} transform={`rotate(-90 18 ${(y(H) + baseline) / 2})`} textAnchor="middle">
        {dims.height_m} m
      </text>

      {/* shapes */}
      {shapes.map(({ sec, el }) => (
        <g
          key={sec.id}
          className={`cut-section ${sec.kind === 'engines' ? 'engines' : ''} ${selectedId === sec.id ? 'sel' : ''}`}
          onClick={() => onSelect(sec.id === selectedId ? null : sec.id)}
        >
          <title>{sec.name_he}</title>
          {el}
        </g>
      ))}

      {/* leader lines + labels */}
      {labels.map((l) => {
        const sel = selectedId === l.sec.id
        const x1 = l.side === 'right' ? CX + l.edgeX : CX - l.edgeX
        const xElbow = l.side === 'right' ? CX + maxEdge + 40 : CX - maxEdge - 40
        const xText = l.side === 'right' ? VB_W - 6 : 6
        const anchor = l.side === 'right' ? 'end' : 'start'
        return (
          <g key={l.sec.id} onClick={() => onSelect(l.sec.id === selectedId ? null : l.sec.id)} style={{ cursor: 'pointer' }}>
            <path className={`cut-leader ${sel ? 'sel' : ''}`} d={`M ${x1} ${l.midY} L ${xElbow} ${l.labelY} L ${l.side === 'right' ? xText - 2 : xText + 2} ${l.labelY}`} fill="none" />
            <circle cx={x1} cy={l.midY} r="1.8" fill={sel ? 'var(--telemetry)' : 'rgba(148,175,230,0.5)'} />
            <text className={`cut-label ${sel ? 'sel' : ''}`} x={xText} y={l.labelY - 3} textAnchor={anchor}>
              {l.sec.name_he}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

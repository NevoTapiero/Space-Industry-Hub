// Mini top-view diagram of an engine cluster, drawn from the layout enum.

const LAYOUTS = {
  single: () => [[0, 0, 0.5]],
  cluster2: () => ring(2, 0.45, 0.32),
  cluster3: () => ring(3, 0.5, 0.3),
  cluster4: () => ring(4, 0.52, 0.28),
  cluster6: () => ring(6, 0.58, 0.24),
  cluster7: () => [[0, 0, 0.24], ...ring(6, 0.58, 0.24)],
  octaweb: () => [[0, 0, 0.2], ...ring(8, 0.62, 0.2)],
  ring: (count) => ring(count || 8, 0.6, 0.2),
  ring33: () => [
    ...ring(3, 0.16, 0.09),
    ...ring(10, 0.42, 0.09),
    ...ring(20, 0.74, 0.09),
  ],
}

function ring(n, radius, size, phase = -Math.PI / 2) {
  return Array.from({ length: n }, (_, i) => {
    const a = phase + (i / n) * Math.PI * 2
    return [Math.cos(a) * radius, Math.sin(a) * radius, size]
  })
}

export default function EngineCluster({ engine }) {
  if (!engine) return null
  const gen = LAYOUTS[engine.layout] || LAYOUTS.ring
  let circles = gen(engine.count)
  // fall back to a generic ring matching the real count when layout is generic
  if (engine.layout === 'ring' || (!LAYOUTS[engine.layout] && engine.count)) {
    circles = engine.count === 1 ? LAYOUTS.single() : ring(engine.count, 0.6, Math.min(0.22, 1.6 / engine.count))
  }

  return (
    <div className="engine-mini">
      <div className="engine-mini-title">
        Engine layout · {engine.name} ×{engine.count}
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg viewBox="-1 -1 2 2" width="110" height="110" style={{ flexShrink: 0 }}>
          <circle cx="0" cy="0" r="0.95" fill="none" stroke="rgba(148,175,230,0.35)" strokeWidth="0.03" />
          {circles.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,154,92,0.16)" stroke="#ff9a5c" strokeWidth="0.035" />
          ))}
        </svg>
        <div className="fact-table" style={{ borderTop: 'none', flex: 1, minWidth: 180 }}>
          {engine.cycle_he && (
            <div className="fact-row">
              <span className="dim">מחזור עבודה</span>
              <b>{engine.cycle_he}</b>
            </div>
          )}
          {engine.propellant_he && (
            <div className="fact-row">
              <span className="dim">דלק</span>
              <b>{engine.propellant_he}</b>
            </div>
          )}
          {engine.thrust_kn_each != null && (
            <div className="fact-row">
              <span className="dim">דחף למנוע</span>
              <b>{engine.thrust_kn_each.toLocaleString()} kN</b>
            </div>
          )}
          {engine.isp_s != null && (
            <div className="fact-row">
              <span className="dim">דחף סגולי (ISP)</span>
              <b>{engine.isp_s} s</b>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// All vehicles side by side at a common scale, next to a human figure.

import { useNavigate } from 'react-router-dom'

export default function ScaleLineup({ vehicles }) {
  const navigate = useNavigate()
  if (!vehicles.length) return null

  const maxH = Math.max(...vehicles.map((v) => v.dims.height_m))
  const drawH = 300
  const s = drawH / maxH
  const topPad = 30
  const baseline = topPad + drawH

  const slotW = 110
  const W = vehicles.length * slotW + 70

  return (
    <div className="lineup-box">
      <svg className="lineup-svg" viewBox={`0 0 ${W} ${baseline + 46}`} role="img" aria-label="השוואת גדלים בין כלי שיגור">
        <line x1={10} y1={baseline} x2={W - 10} y2={baseline} stroke="rgba(148,175,230,0.35)" strokeWidth="1" />

        {/* human figure, 1.8 m */}
        <g>
          <circle cx={30} cy={baseline - 1.8 * s + 1.2 * s * 0.15} r={1.8 * s * 0.14} fill="rgba(238,242,251,0.85)" />
          <line x1={30} y1={baseline - 1.8 * s * 0.72} x2={30} y2={baseline - 1.8 * s * 0.28} stroke="rgba(238,242,251,0.85)" strokeWidth="1.6" />
          <line x1={30} y1={baseline - 1.8 * s * 0.28} x2={26} y2={baseline} stroke="rgba(238,242,251,0.85)" strokeWidth="1.4" />
          <line x1={30} y1={baseline - 1.8 * s * 0.28} x2={34} y2={baseline} stroke="rgba(238,242,251,0.85)" strokeWidth="1.4" />
          <line x1={30} y1={baseline - 1.8 * s * 0.62} x2={25} y2={baseline - 1.8 * s * 0.42} stroke="rgba(238,242,251,0.85)" strokeWidth="1.4" />
          <line x1={30} y1={baseline - 1.8 * s * 0.62} x2={35} y2={baseline - 1.8 * s * 0.42} stroke="rgba(238,242,251,0.85)" strokeWidth="1.4" />
          <text className="lineup-h" x={30} y={baseline + 14} textAnchor="middle">
            1.8m
          </text>
        </g>

        {vehicles.map((v, i) => {
          const h = v.dims.height_m * s
          const r = Math.max((v.dims.diameter_m / 2) * s, 3.5)
          const cx = 70 + i * slotW + slotW / 2
          const yTop = baseline - h
          const curveH = Math.min(h * 0.12, r * 2.4)
          const d = `M ${cx - r} ${baseline} L ${cx - r} ${yTop + curveH} Q ${cx - r} ${yTop} ${cx} ${yTop} Q ${cx + r} ${yTop} ${cx + r} ${yTop + curveH} L ${cx + r} ${baseline} Z`
          return (
            <g key={v.slug} className="lineup-veh" onClick={() => navigate(`/vehicles/${v.slug}`)}>
              <title>{v.name_he}</title>
              <path className="shape" d={d} />
              <text className="lineup-name" x={cx} y={yTop - 16} textAnchor="middle">
                {v.name_en}
              </text>
              <text className="lineup-h" x={cx} y={yTop - 6} textAnchor="middle">
                {v.dims.height_m}m
              </text>
              <text className="lineup-h" x={cx} y={baseline + 14} textAnchor="middle">
                {v.name_he}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

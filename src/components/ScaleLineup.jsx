// All vehicles side by side at one true scale, drawn with their real
// silhouettes (SRBs, flaps, fins), next to a human figure with a zoom inset.

import { useNavigate } from 'react-router-dom'
import { silhouetteParts } from './Silhouette.jsx'

function Human({ x, baseline, s, opacity = 1 }) {
  // proper proportions: head ~1/7.5 of height
  const h = 1.8 * s
  const head = h / 7.5
  const c = 'rgba(238, 242, 251, 0.9)'
  const w = Math.max(h * 0.02, 0.6)
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={baseline - h + head / 2} r={head / 2} fill={c} />
      <line x1={x} y1={baseline - h + head} x2={x} y2={baseline - h * 0.42} stroke={c} strokeWidth={w * 1.6} strokeLinecap="round" />
      <line x1={x} y1={baseline - h * 0.82} x2={x - h * 0.16} y2={baseline - h * 0.55} stroke={c} strokeWidth={w} strokeLinecap="round" />
      <line x1={x} y1={baseline - h * 0.82} x2={x + h * 0.16} y2={baseline - h * 0.55} stroke={c} strokeWidth={w} strokeLinecap="round" />
      <line x1={x} y1={baseline - h * 0.42} x2={x - h * 0.13} y2={baseline} stroke={c} strokeWidth={w * 1.2} strokeLinecap="round" />
      <line x1={x} y1={baseline - h * 0.42} x2={x + h * 0.13} y2={baseline} stroke={c} strokeWidth={w * 1.2} strokeLinecap="round" />
    </g>
  )
}

export default function ScaleLineup({ vehicles }) {
  const navigate = useNavigate()
  if (!vehicles.length) return null

  const maxH = Math.max(...vehicles.map((v) => v.dims.height_m))
  const drawH = 380
  const s = drawH / maxH
  const topPad = 46
  const baseline = topPad + drawH

  // pre-compute silhouettes to know real widths
  const sils = vehicles.map((v) => ({ v, sil: silhouetteParts(v, s) }))
  const gap = 46
  let x = 150
  const placed = sils.map(({ v, sil }) => {
    const cx = x + sil.halfWidth
    x = cx + sil.halfWidth + gap
    return { v, sil, cx }
  })
  const W = x + 20

  return (
    <div className="lineup-box">
      <svg className="lineup-svg" viewBox={`0 0 ${W} ${baseline + 52}`} style={{ minWidth: Math.min(W, 1100) }} role="img" aria-label="השוואת גדלים בין כלי שיגור">
        <line x1={14} y1={baseline} x2={W - 14} y2={baseline} stroke="rgba(148,175,230,0.4)" strokeWidth="1" />

        {/* human: true scale + magnified inset */}
        <g>
          <circle cx={62} cy={baseline - 64} r={34} fill="rgba(110,168,255,0.05)" stroke="rgba(148,175,230,0.4)" strokeDasharray="3 3" />
          <Human x={62} baseline={baseline - 36} s={Math.min(30, s * 16)} />
          <line x1={78} y1={baseline - 40} x2={104} y2={baseline - 4} stroke="rgba(148,175,230,0.4)" strokeDasharray="3 3" strokeWidth="1" />
          <Human x={106} baseline={baseline} s={s} />
          <text className="lineup-h" x={62} y={baseline - 106} textAnchor="middle">אדם · 1.8m</text>
        </g>

        {placed.map(({ v, sil, cx }) => (
          <g key={v.slug} className="lineup-veh" transform={`translate(${cx}, ${topPad + (drawH - sil.height)})`} onClick={() => navigate(`/vehicles/${v.slug}`)} style={{ cursor: 'pointer' }}>
            <title>{v.name_he}</title>
            {sil.parts.map((p, i) =>
              p.rect ? (
                <rect key={i} className="sil-shape" x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} />
              ) : (
                <path key={i} className="sil-shape" d={p.d} />
              ),
            )}
            <text className="lineup-name" y={-22} textAnchor="middle">{v.name_en}</text>
            <text className="lineup-h" y={-10} textAnchor="middle">{v.dims.height_m}m</text>
            <text className="lineup-heb" y={sil.height + 20} textAnchor="middle">{v.name_he}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// Real-shape vehicle silhouette, generated from the same section data that
// drives the cutaway (noses, fairings, SRBs, fins, flaps, engine bells).

export function silhouetteParts(vehicle, ppm) {
  const H = vehicle.dims.height_m
  const r = Math.max((vehicle.dims.diameter_m / 2) * ppm, 2.5)
  const y = (m) => (H - m) * ppm
  const stack = vehicle.sections.filter((s) => !s.overlay)
  const overlays = vehicle.sections.filter((s) => s.overlay)
  const parts = []
  let maxX = r

  for (const sec of stack) {
    const y0 = y(sec.to_m)
    const y1 = y(sec.from_m)
    const isTop = Math.abs(sec.to_m - H) < 0.02 * H
    if (isTop && ['fairing', 'nosecone', 'payload', 'capsule', 'escape_tower'].includes(sec.kind)) {
      if (sec.kind === 'escape_tower') {
        parts.push({ d: `M ${-r * 0.22} ${y1} L ${-r * 0.22} ${y0 + (y1 - y0) * 0.3} L 0 ${y0} L ${r * 0.22} ${y0 + (y1 - y0) * 0.3} L ${r * 0.22} ${y1} Z` })
      } else if (sec.kind === 'capsule') {
        parts.push({ d: `M ${-r} ${y1} L ${-r * 0.4} ${y0} L ${r * 0.4} ${y0} L ${r} ${y1} Z` })
      } else {
        const curveH = Math.min((y1 - y0) * 0.75, r * 2.6)
        parts.push({ d: `M ${-r} ${y1} L ${-r} ${y0 + curveH} Q ${-r} ${y0} 0 ${y0} Q ${r} ${y0} ${r} ${y0 + curveH} L ${r} ${y1} Z` })
      }
    } else if (sec.kind === 'capsule') {
      parts.push({ d: `M ${-r} ${y1} L ${-r * 0.42} ${y0} L ${r * 0.42} ${y0} L ${r} ${y1} Z` })
    } else if (sec.kind === 'engines') {
      parts.push({ rect: [-r, y0, r * 2, y1 - y0] })
      const n = Math.min(sec.engine?.count || 3, 5)
      const bw = (r * 2) / (n + 1)
      for (let i = 0; i < n; i++) {
        const bx = -r + bw * (i + 1)
        parts.push({ d: `M ${bx - bw * 0.22} ${y1} L ${bx - bw * 0.34} ${y1 + Math.min(6, ppm * 1.5)} L ${bx + bw * 0.34} ${y1 + Math.min(6, ppm * 1.5)} L ${bx + bw * 0.22} ${y1} Z` })
      }
    } else {
      parts.push({ rect: [-r, y0, r * 2, y1 - y0] })
    }
  }

  for (const sec of overlays) {
    const y0 = y(sec.to_m)
    const y1 = y(sec.from_m)
    const hh = y1 - y0
    if (sec.kind === 'srb') {
      const sr = Math.max(r * 0.45, 2.5)
      const gap = Math.max(1.5, ppm * 0.15)
      const x0 = r + gap
      maxX = Math.max(maxX, x0 + sr * 2)
      for (const side of [-1, 1]) {
        const xa = side === 1 ? x0 : -x0 - sr * 2
        parts.push({ rect: [xa, y0 + sr * 1.6, sr * 2, hh - sr * 1.6] })
        parts.push({ d: `M ${xa} ${y0 + sr * 1.6} L ${xa + sr * 0.3} ${y0} L ${xa + sr * 1.7} ${y0} L ${xa + sr * 2} ${y0 + sr * 1.6} Z` })
      }
    } else if (sec.kind === 'gridfins') {
      const w = Math.max(2.5, r * 0.28)
      maxX = Math.max(maxX, r + w)
      parts.push({ rect: [-r - w, y0, w, hh] })
      parts.push({ rect: [r, y0, w, hh] })
    } else if (sec.kind === 'flaps') {
      const w = Math.max(3.5, r * 0.55)
      maxX = Math.max(maxX, r + w)
      parts.push({ d: `M ${-r} ${y0} L ${-r - w} ${y0 + hh * 0.18} L ${-r - w} ${y1 - hh * 0.1} L ${-r} ${y1} Z` })
      parts.push({ d: `M ${r} ${y0} L ${r + w} ${y0 + hh * 0.18} L ${r + w} ${y1 - hh * 0.1} L ${r} ${y1} Z` })
    } else if (sec.kind === 'legs') {
      const w = Math.max(3, r * 0.4)
      maxX = Math.max(maxX, r + w)
      parts.push({ d: `M ${-r} ${y0} L ${-r - w} ${y1} L ${-r - w * 0.55} ${y1} L ${-r + 1} ${y0 + 2} Z` })
      parts.push({ d: `M ${r} ${y0} L ${r + w} ${y1} L ${r + w * 0.55} ${y1} L ${r - 1} ${y0 + 2} Z` })
    } else if (sec.kind === 'strakes') {
      const w = Math.max(3, r * 0.5)
      maxX = Math.max(maxX, r + w)
      parts.push({ d: `M ${-r} ${y0} L ${-r - w} ${y1} L ${-r} ${y1} Z` })
      parts.push({ d: `M ${r} ${y0} L ${r + w} ${y1} L ${r} ${y1} Z` })
    }
  }

  return { parts, height: H * ppm, halfWidth: maxX + 3 }
}

export default function Silhouette({ vehicle, ppm, h, className = '' }) {
  const scale = ppm || (h || 160) / vehicle.dims.height_m
  const { parts, height, halfWidth } = silhouetteParts(vehicle, scale)
  const pad = 4
  return (
    <svg
      className={className}
      viewBox={`${-halfWidth} ${-pad} ${halfWidth * 2} ${height + pad + 8}`}
      height={height + pad + 8}
      role="img"
      aria-label={vehicle.name_he}
    >
      {parts.map((p, i) =>
        p.rect ? (
          <rect key={i} className="sil-shape" x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} />
        ) : (
          <path key={i} className="sil-shape" d={p.d} />
        ),
      )}
    </svg>
  )
}

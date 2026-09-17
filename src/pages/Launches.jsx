import { useState } from 'react'
import { useLaunches } from '../hooks.js'
import { COMPANIES } from '../data/index.js'
import { Reveal, LaunchList } from '../components/ui.jsx'

export default function Launches() {
  const data = useLaunches()
  const [filter, setFilter] = useState(null)

  const companiesWithId = COMPANIES.filter((c) => c.ll2_id)
  const filtered = filter ? data.launches.filter((l) => l.providerId === filter) : data.launches

  return (
    <div className="page container">
      <div className="page-head">
        <div className="eyebrow">Launch Manifest · Live</div>
        <h1 className="h-display">לוח שיגורים עולמי</h1>
        <p className="lead">כל השיגורים הקרובים, מכל הספקים, בזמן אמת. הנתונים מ-Launch Library 2 של The Space Devs.</p>
      </div>

      <div className="filter-row">
        <button className={`filter-btn ${filter === null ? 'on' : ''}`} onClick={() => setFilter(null)}>
          הכול
        </button>
        {companiesWithId.map((c) => (
          <button key={c.slug} className={`filter-btn ${filter === c.ll2_id ? 'on' : ''}`} onClick={() => setFilter(c.ll2_id)}>
            {c.name_he}
          </button>
        ))}
      </div>

      <Reveal className="panel">
        {data.loading && <div className="loading">ACQUIRING TELEMETRY…</div>}
        {data.error && <div className="err-note">{data.error}</div>}
        {!data.loading && !data.error && <LaunchList launches={filtered} withWebcast />}
        {data.stale && <div className="stale-note">מוצגים נתונים מהמטמון, העדכון האחרון נכשל</div>}
      </Reveal>
    </div>
  )
}

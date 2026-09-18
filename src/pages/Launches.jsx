import { useState } from 'react'
import { useLaunches } from '../hooks.js'
import { COMPANIES } from '../data/index.js'
import { Reveal, StatusChip } from '../components/ui.jsx'

const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function LaunchCard({ l, delay }) {
  const d = new Date(l.net)
  return (
    <Reveal delay={delay}>
      <div className={`launch-card ${l.image ? 'has-img' : ''}`}>
        <div className="lc-date">
          <div className="lc-day">{d.getDate()}</div>
          <div className="lc-month">{MONTHS_EN[d.getMonth()]}</div>
          <div className="lc-time">{d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        {l.image && (
          <div className="lc-img">
            <img src={l.image} alt="" loading="lazy" />
          </div>
        )}
        <div>
          <div className="lc-name">{l.name}</div>
          <div className="lc-details">
            {l.provider} · {l.pad}, {l.location}
            {l.orbit ? ` · מסלול: ${l.orbit}` : ''}
          </div>
        </div>
        <div className="lc-side">
          <StatusChip status={l.status} />
          {l.webcasts.length > 0 && (
            <a className="webcast-link" href={l.webcasts[0]} target="_blank" rel="noreferrer">
              ▶ שידור חי
            </a>
          )}
        </div>
      </div>
    </Reveal>
  )
}

export default function Launches() {
  const data = useLaunches()
  const [filter, setFilter] = useState(null)

  const companiesWithId = COMPANIES.filter((c) => c.ll2_id)
  const filtered = filter ? data.launches.filter((l) => l.providerId === filter) : data.launches

  return (
    <div className="page container">
      <div className="page-head">
        <h1 className="h-display">לוח שיגורים עולמי</h1>
        <p className="lead">כל השיגורים הקרובים בעולם, מכל החברות, בזמן אמת. אפשר לסנן לפי חברה וללחוץ לשידור החי.</p>
      </div>

      <div className="filter-row" style={{ marginBottom: 26 }}>
        <button className={`filter-btn ${filter === null ? 'on' : ''}`} onClick={() => setFilter(null)}>
          הכול
        </button>
        {companiesWithId.map((c) => (
          <button key={c.slug} className={`filter-btn ${filter === c.ll2_id ? 'on' : ''}`} onClick={() => setFilter(c.ll2_id)}>
            {c.name_he}
          </button>
        ))}
      </div>

      {data.loading && <div className="loading">ACQUIRING TELEMETRY…</div>}
      {data.error && <div className="err-note">{data.error}</div>}
      {!data.loading && !data.error && filtered.length === 0 && (
        <div className="panel"><div className="loading">אין שיגורים קרובים לחברה הזאת ברשימה הנוכחית</div></div>
      )}
      {filtered.map((l, i) => (
        <LaunchCard key={l.id} l={l} delay={Math.min(i * 40, 200)} />
      ))}
      {data.stale && <div className="stale-note">מוצגים נתונים מהמטמון, העדכון האחרון נכשל</div>}
    </div>
  )
}

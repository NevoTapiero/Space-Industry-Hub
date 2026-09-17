import { useEffect, useMemo, useState } from 'react'
import { fetchUpcomingLaunches, fetchNews } from './api.js'
import { ARTICLES } from './knowledge.js'
import Countdown from './Countdown.jsx'
import RocketViewer from './RocketViewer.jsx'

const NAV = [
  { id: 'dashboard', label: 'מרכז בקרה', glyph: '◉' },
  { id: 'launches', label: 'לוח שיגורים', glyph: '↥' },
  { id: 'hangar', label: 'האנגר תלת ממד', glyph: '⬡' },
  { id: 'knowledge', label: 'מנוע ידע', glyph: '▤' },
]

function fmtDate(iso) {
  return new Date(iso).toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(status) {
  const cls = status === 'Go' ? 'go' : status === 'TBD' || status === 'TBC' ? 'tbd' : ''
  return <span className={`badge ${cls}`}>{status || '—'}</span>
}

function useLaunchData() {
  const [state, setState] = useState({ launches: [], news: [], stale: false, error: null, loading: true })

  useEffect(() => {
    let alive = true
    Promise.allSettled([fetchUpcomingLaunches(), fetchNews()]).then(([l, n]) => {
      if (!alive) return
      const launches = l.status === 'fulfilled' ? l.value.launches : []
      const news = n.status === 'fulfilled' ? n.value.articles : []
      const stale = (l.status === 'fulfilled' && l.value.stale) || (n.status === 'fulfilled' && n.value.stale)
      const error = l.status === 'rejected' ? 'לא הצלחתי למשוך נתוני שיגורים (ייתכן שחרגנו ממכסת ה-API, נסה שוב בעוד שעה)' : null
      setState({ launches, news, stale, error, loading: false })
    })
    return () => { alive = false }
  }, [])

  return state
}

function LaunchRow({ l }) {
  return (
    <div className="launch-row">
      <div>
        <div className="launch-name">{l.name}</div>
        <div className="launch-details">
          {l.provider} · {l.pad} · {l.location}{l.orbit ? ` · ${l.orbit}` : ''}
        </div>
      </div>
      <div className="launch-time">
        {fmtDate(l.net)}
        <div>{statusBadge(l.status)}</div>
      </div>
    </div>
  )
}

function Dashboard({ data }) {
  const next = data.launches[0]
  return (
    <>
      <h1 className="page-title">מרכז בקרה</h1>
      <p className="page-sub">תמונת מצב חיה של תעשיית החלל: השיגור הקרוב, הלוח המלא, והחדשות האחרונות.</p>

      <div className="panel hero">
        <div className="panel-label">Next Launch</div>
        {data.loading && <div className="loading">ACQUIRING TELEMETRY…</div>}
        {data.error && <div className="err-note">{data.error}</div>}
        {next && (
          <>
            <div className="hero-mission">{next.name}</div>
            <div className="hero-meta">
              {next.provider} · {next.rocket} · {next.pad}, {next.location} {statusBadge(next.status)}
            </div>
            <Countdown target={next.net} />
          </>
        )}
        {data.stale && <div className="stale-note">מוצגים נתונים מהמטמון (העדכון האחרון נכשל או שחיכינו למכסה)</div>}
      </div>

      <div className="grid cols-2">
        <div className="panel">
          <div className="panel-label">Launch Manifest</div>
          {data.launches.slice(1, 6).map((l) => <LaunchRow key={l.id} l={l} />)}
          {!data.loading && data.launches.length === 0 && !data.error && (
            <div className="loading">NO DATA</div>
          )}
        </div>
        <div className="panel">
          <div className="panel-label">Industry Feed</div>
          {data.news.slice(0, 6).map((a) => (
            <div className="news-item" key={a.id}>
              <a href={a.url} target="_blank" rel="noreferrer">{a.title}</a>
              <div className="news-meta">{a.site} · {fmtDate(a.published)}</div>
            </div>
          ))}
          {!data.loading && data.news.length === 0 && <div className="loading">NO DATA</div>}
        </div>
      </div>
    </>
  )
}

function Launches({ data }) {
  return (
    <>
      <h1 className="page-title">לוח שיגורים</h1>
      <p className="page-sub">
        כל השיגורים הקרובים בעולם, מכל הספקים, בזמן אמת (מקור: Launch Library 2 של The Space Devs).
      </p>
      <div className="panel">
        <div className="panel-label">Upcoming — Global</div>
        {data.loading && <div className="loading">ACQUIRING TELEMETRY…</div>}
        {data.error && <div className="err-note">{data.error}</div>}
        {data.launches.map((l) => <LaunchRow key={l.id} l={l} />)}
      </div>
    </>
  )
}

function Knowledge() {
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState(null)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return ARTICLES
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.body.toLowerCase().includes(needle) ||
        a.tags.some((t) => t.toLowerCase().includes(needle)),
    )
  }, [q])

  return (
    <>
      <h1 className="page-title">מנוע ידע</h1>
      <p className="page-sub">
        מאגר הידע ההנדסי שלך. כרגע מאמרי יסוד; בשלב הבא נוסיף אינדקס חיפוש על תמלילי Everyday
        Astronaut ומאמרים טכניים.
      </p>
      <input
        className="search-box"
        placeholder="חיפוש: מנועים, מסלולים, שימוש חוזר…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid">
        {results.map((a) => {
          const open = openId === a.id
          return (
            <div className="panel kb-card" key={a.id} onClick={() => setOpenId(open ? null : a.id)}>
              <div className="kb-title">{a.title}</div>
              <div className="kb-tags">
                {a.tags.map((t) => <span className="badge" key={t}>{t}</span>)}
              </div>
              <div className={`kb-body ${open ? '' : 'clamped'}`}>{a.body}</div>
            </div>
          )
        })}
        {results.length === 0 && <div className="loading">לא נמצאו תוצאות</div>}
      </div>
    </>
  )
}

function Hangar() {
  return (
    <>
      <h1 className="page-title">האנגר תלת ממד</h1>
      <p className="page-sub">מודל אינטראקטיבי: סובב, קרב, והפרד את הטיל לשלבים כדי לחקור את המבנה.</p>
      <RocketViewer />
    </>
  )
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const data = useLaunchData()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          SPACE HUB
          <small>MISSION CONTROL</small>
        </div>
        <div className="nav-sep" />
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-btn ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="glyph">{n.glyph}</span>
            {n.label}
          </button>
        ))}
        <div className="sidebar-foot">
          <span className="status-dot" />
          TELEMETRY: The Space Devs
          <br />
          NEWS: Spaceflight News API
        </div>
      </aside>
      <main className="main">
        {page === 'dashboard' && <Dashboard data={data} />}
        {page === 'launches' && <Launches data={data} />}
        {page === 'knowledge' && <Knowledge />}
        {page === 'hangar' && <Hangar />}
      </main>
    </div>
  )
}

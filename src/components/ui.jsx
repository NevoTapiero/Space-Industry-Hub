import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { getImage } from '../data/index.js'
import { useAuth } from '../lib/auth.jsx'

/* ---------- scroll reveal ---------- */

export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  )
}

/* ---------- full-bleed background image with credit + fallback ---------- */

export function Backdrop({ imageKey, className = 'hero-bg' }) {
  const img = getImage(imageKey)
  return (
    <>
      <div className={className}>
        {img ? <img src={img.url} alt="" loading="lazy" /> : <div className="ph-bg" />}
      </div>
      <div className="scrim" />
      {img && img.credit && <div className="credit">{img.credit}</div>}
    </>
  )
}

/* ---------- navigation ---------- */

const LINKS = [
  { to: '/', label: 'ראשי', end: true },
  { to: '/launches', label: 'שיגורים' },
  { to: '/companies', label: 'חברות' },
  { to: '/vehicles', label: 'כלי שיגור' },
  { to: '/engines', label: 'מנועים' },
  { to: '/hangar', label: 'הגראז\'' },
  { to: '/sources', label: 'מקורות' },
]

export function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={`nav ${solid || open ? 'solid' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          SPACE<span>HUB</span>
        </Link>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <LiveClock />
        <AuthControl />
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="תפריט">
          ☰
        </button>
      </div>
    </header>
  )
}

function AuthControl() {
  const { user, signIn, signOut, enabled } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [errMsg, setErrMsg] = useState('')

  if (!enabled) return null

  const submit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setState('sending')
    const { error } = await signIn(email.trim())
    if (error) {
      setState('error')
      setErrMsg(error)
    } else setState('sent')
  }

  return (
    <div className="auth-box">
      {user ? (
        <button className="auth-btn" onClick={() => signOut()} title={user.email}>
          <span className="dot" style={{ marginInlineEnd: 7 }} />
          {user.email.split('@')[0]} · יציאה
        </button>
      ) : (
        <button className="auth-btn" onClick={() => setOpen(!open)}>
          התחברות
        </button>
      )}
      {open && !user && (
        <div className="auth-pop">
          {state === 'sent' ? (
            <p className="part-desc" style={{ margin: 0 }}>
              נשלח קישור התחברות אל {email}. פתח את המייל ולחץ עליו.
            </p>
          ) : (
            <form onSubmit={submit}>
              <div className="panel-title" style={{ fontSize: 15 }}>
                כניסה ל-SpaceHub
              </div>
              <p className="part-desc" style={{ margin: '6px 0 10px', fontSize: 13 }}>
                בלי סיסמה: מקבלים קישור חד פעמי למייל, והצפיות שלך נשמרות בין מכשירים.
              </p>
              <input
                className="search-box"
                style={{ padding: '10px 14px', fontSize: 14 }}
                type="email"
                dir="ltr"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn primary" style={{ width: '100%', marginTop: 10, padding: '10px 0' }} disabled={state === 'sending'}>
                {state === 'sending' ? 'שולח…' : 'שלח לי קישור'}
              </button>
              {state === 'error' && <div className="err-note">{errMsg}</div>}
            </form>
          )}
        </div>
      )}
    </div>
  )
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="nav-live">
      <span className="dot" />
      <span>UTC {now.toISOString().slice(11, 19)}</span>
    </div>
  )
}

/* ---------- footer ---------- */

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="nav-brand">
          SPACE<span>HUB</span>
        </div>
        <div className="mono">TELEMETRY: The Space Devs · NEWS: Spaceflight News API · KNOWLEDGE: Everyday Astronaut</div>
      </div>
    </footer>
  )
}

/* ---------- scroll progress bar ---------- */

export function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />
}

/* ---------- scroll restore on route change ---------- */

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/* ---------- launch + news lists (shared) ---------- */

export function fmtDate(iso) {
  return new Date(iso).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const STATUS_HE = {
  Go: 'מאושר לשיגור',
  TBC: 'ממתין לאישור',
  TBD: 'מועד לא סופי',
  Success: 'הצליח',
  Failure: 'נכשל',
  Hold: 'בהשהיה',
  'In Flight': 'בטיסה',
}

export function StatusChip({ status }) {
  const cls = status === 'Go' || status === 'Success' ? 'go' : status === 'TBD' || status === 'TBC' || status === 'Hold' ? 'tbd' : ''
  return (
    <span className={`chip ${cls}`} title={`סטטוס: ${status}`}>
      {STATUS_HE[status] || status || 'לא ידוע'}
    </span>
  )
}

export function LaunchList({ launches, withWebcast = false }) {
  if (!launches.length) return <div className="loading">NO DATA</div>
  return launches.map((l) => (
    <div className={`launch-row ${l.image ? 'has-img' : ''}`} key={l.id}>
      {l.image && (
        <div className="row-thumb">
          <img src={l.image} alt="" loading="lazy" />
        </div>
      )}
      <div>
        <div className="launch-name">{l.name}</div>
        <div className="launch-details">
          {l.provider} · {l.pad} · {l.location}
          {l.orbit ? ` · ${l.orbit}` : ''}
        </div>
        {withWebcast && l.webcasts.length > 0 && (
          <a className="webcast-link" href={l.webcasts[0]} target="_blank" rel="noreferrer">
            ▶ שידור חי
          </a>
        )}
      </div>
      <div className="launch-time">
        {fmtDate(l.net)}
        <StatusChip status={l.status} />
      </div>
    </div>
  ))
}

export function NewsList({ articles }) {
  if (!articles.length) return <div className="loading">NO DATA</div>
  return articles.map((a) => (
    <div className={`news-item ${a.image ? 'has-img' : ''}`} key={a.id}>
      {a.image && (
        <div className="row-thumb">
          <img src={a.image} alt="" loading="lazy" />
        </div>
      )}
      <div>
        <a href={a.url} target="_blank" rel="noreferrer">
          {a.title}
        </a>
        <div className="news-meta">
          {a.site} · {fmtDate(a.published)}
        </div>
      </div>
    </div>
  ))
}

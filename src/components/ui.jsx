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

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function AuthControl() {
  const { user, signInWithGoogle, signOut, enabled } = useAuth()
  const [busy, setBusy] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  if (!enabled) return null

  const go = async () => {
    setBusy(true)
    setErrMsg('')
    const { error } = await signInWithGoogle()
    if (error) {
      setBusy(false)
      setErrMsg(error)
    }
    // on success the browser redirects to Google
  }

  return (
    <div className="auth-box">
      {user ? (
        <button className="auth-btn" onClick={() => signOut()} title={user.email}>
          <span className="dot" style={{ marginInlineEnd: 7 }} />
          {user.user_metadata?.name || user.email.split('@')[0]} · יציאה
        </button>
      ) : (
        <button className="auth-btn" onClick={go} disabled={busy}>
          <span style={{ display: 'inline-flex', marginInlineEnd: 8, verticalAlign: 'middle' }}>
            <GoogleMark />
          </span>
          {busy ? 'מעביר לגוגל…' : 'התחברות עם Google'}
        </button>
      )}
      {errMsg && (
        <div className="auth-pop">
          <p className="err-note" style={{ padding: 0 }}>{errMsg}</p>
          <p className="part-desc" style={{ margin: '6px 0 0', fontSize: 12.5 }}>
            אם זו הפעם הראשונה: צריך להפעיל את ספק Google בהגדרות ה-Auth של Supabase.
          </p>
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
  // rAF-batched, writes straight to the DOM: zero React re-renders per frame
  const ref = useRef(null)
  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (ref.current) ref.current.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <div ref={ref} className="scroll-progress" />
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

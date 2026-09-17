import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { getImage } from '../data/index.js'

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
  { to: '/hangar', label: 'האנגר' },
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
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="תפריט">
          ☰
        </button>
      </div>
    </header>
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

export function StatusChip({ status }) {
  const cls = status === 'Go' ? 'go' : status === 'TBD' || status === 'TBC' ? 'tbd' : ''
  return <span className={`chip ${cls}`}>{status || '—'}</span>
}

export function LaunchList({ launches, withWebcast = false }) {
  if (!launches.length) return <div className="loading">NO DATA</div>
  return launches.map((l) => (
    <div className="launch-row" key={l.id}>
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
    <div className="news-item" key={a.id}>
      <a href={a.url} target="_blank" rel="noreferrer">
        {a.title}
      </a>
      <div className="news-meta">
        {a.site} · {fmtDate(a.published)}
      </div>
    </div>
  ))
}

import { Link } from 'react-router-dom'
import { useLaunches, useNews } from '../hooks.js'
import { COMPANIES, VEHICLES } from '../data/index.js'
import Countdown from '../Countdown.jsx'
import ScaleLineup from '../components/ScaleLineup.jsx'
import { Backdrop, Reveal, LaunchList, NewsList, StatusChip } from '../components/ui.jsx'

export default function Home() {
  const data = useLaunches()
  const news = useNews('', 6)
  const next = data.launches[0]
  const featured = COMPANIES.slice(0, 3)

  return (
    <>
      {/* ---------- hero: the next launch ---------- */}
      <section className="hero">
        <Backdrop imageKey="home_hero" />
        <div className="hero-content">
          <div className="eyebrow">Next Launch</div>
          {data.loading && <div className="loading">ACQUIRING TELEMETRY…</div>}
          {data.error && <div className="err-note">{data.error}</div>}
          {next && (
            <>
              <h1 className="hero-title">{next.name}</h1>
              <p className="hero-sub">
                {next.provider} · {next.rocket} · {next.pad}, {next.location} <StatusChip status={next.status} />
              </p>
              <div style={{ marginTop: 34 }}>
                <Countdown target={next.net} />
              </div>
              <div className="hero-cta">
                <Link className="btn primary" to="/launches">
                  לוח השיגורים המלא
                </Link>
                {next.webcasts.length > 0 && (
                  <a className="btn" href={next.webcasts[0]} target="_blank" rel="noreferrer">
                    ▶ שידור חי
                  </a>
                )}
              </div>
            </>
          )}
          {data.stale && <div className="stale-note">מוצגים נתונים מהמטמון, העדכון האחרון נכשל</div>}
        </div>
      </section>

      {/* ---------- featured companies, SpaceX-homepage style ---------- */}
      {featured.map((c, i) => (
        <section className="full short" key={c.slug}>
          <Backdrop imageKey={`company-${c.slug}-hero`} className="full-bg" />
          <div className="full-content">
            <Reveal>
              <div className="eyebrow">{c.name_en}</div>
              <h2 className="hero-title" style={{ fontSize: 'clamp(30px, 4.6vw, 54px)' }}>
                {c.tagline_he}
              </h2>
              <div className="hero-cta">
                <Link className="btn" to={`/companies/${c.slug}`}>
                  כל הפיתוחים של {c.name_he}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* ---------- fleet, to scale ---------- */}
      <section className="page" style={{ paddingBottom: 30 }}>
        <div className="container">
          <Reveal>
            <h2 className="h-display" style={{ margin: '0 0 8px' }}>
              צי השיגור העולמי
            </h2>
            <p className="lead">כל הכלים באתר, זה לצד זה, בקנה מידה אחד. לחיצה על כלי פותחת את דיאגרמת החתך המלאה שלו.</p>
          </Reveal>
          <Reveal delay={120}>
            <ScaleLineup vehicles={VEHICLES} />
          </Reveal>
        </div>
      </section>

      {/* ---------- feed ---------- */}
      <section className="container" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <Reveal className="panel">
            <div className="panel-title">השיגורים הבאים</div>
            {data.loading ? <div className="loading">LOADING…</div> : <LaunchList launches={data.launches.slice(1, 6)} />}
          </Reveal>
          <Reveal className="panel" delay={100}>
            <div className="panel-title">חדשות התעשייה</div>
            {news.loading ? <div className="loading">LOADING…</div> : <NewsList articles={news.articles} />}
          </Reveal>
        </div>
      </section>
    </>
  )
}

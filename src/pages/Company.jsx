import { useParams, Link, Navigate } from 'react-router-dom'
import { companyBySlug, vehiclesOfCompany } from '../data/index.js'
import { useLaunches, useNews } from '../hooks.js'
import { Backdrop, Reveal, LaunchList, NewsList } from '../components/ui.jsx'

export default function Company() {
  const { slug } = useParams()
  const c = companyBySlug(slug)
  const data = useLaunches()
  const news = useNews(c?.news_query || '', 8)

  if (!c) return <Navigate to="/companies" replace />

  const vehicles = vehiclesOfCompany(slug)
  const companyLaunches = c.ll2_id ? data.launches.filter((l) => l.providerId === c.ll2_id) : []

  return (
    <>
      <section className="full short">
        <Backdrop imageKey={`company-${c.slug}-hero`} className="full-bg" />
        <div className="full-content">
          <div className="eyebrow">{c.name_en}</div>
          <h1 className="hero-title">{c.name_he}</h1>
          <p className="hero-sub">{c.tagline_he}</p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 90 }}>
        {/* stats */}
        {c.stats?.length > 0 && (
          <Reveal className="stat-bar">
            {c.stats.map((s) => (
              <div className="stat-cell" key={s.label_he}>
                <div className="stat-val">{s.value}</div>
                <div className="stat-label">{s.label_he}</div>
                {s.sub_he && <div className="stat-sub">{s.sub_he}</div>}
              </div>
            ))}
          </Reveal>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 40 }} className="co-layout">
          <div>
            <Reveal>
              {(c.description_he || '').split('\n\n').map((p, i) => (
                <p key={i} className="lead" style={{ marginBottom: 16 }}>
                  {p}
                </p>
              ))}
            </Reveal>

            {/* vehicles of this company */}
            {vehicles.length > 0 && (
              <Reveal>
                <div className="eyebrow section-gap" style={{ marginBottom: 6 }}>
                  Fleet
                </div>
                <div className="filter-row">
                  {vehicles.map((v) => (
                    <Link key={v.slug} to={`/vehicles/${v.slug}`} className="filter-btn">
                      {v.name_he} ↗
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            {/* programs */}
            {c.programs?.length > 0 && (
              <Reveal>
                <div className="eyebrow section-gap">Programs</div>
                <div className="program-grid">
                  {c.programs.map((p) => (
                    <div className="program" key={p.name}>
                      <div className="program-name">{p.name}</div>
                      {p.status_he && (
                        <span className="chip" style={{ marginTop: 8 }}>
                          {p.status_he}
                        </span>
                      )}
                      <div className="program-desc">{p.desc_he}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* timeline */}
            {c.timeline?.length > 0 && (
              <>
                <Reveal>
                  <div className="eyebrow section-gap">Development Log</div>
                  <h2 className="h-display" style={{ fontSize: 30, margin: '10px 0 0' }}>
                    ציר הפיתוחים
                  </h2>
                </Reveal>
                <div className="timeline" style={{ '--tl-color': c.color }}>
                  {c.timeline.map((t, i) => (
                    <Reveal key={i} className="tl-item" delay={Math.min(i * 40, 200)}>
                      <div className="tl-date">
                        {t.date}
                        {t.tag_he && <span className="chip tl-tag">{t.tag_he}</span>}
                      </div>
                      <div className="tl-title">{t.title_he}</div>
                      <div className="tl-text">{t.text_he}</div>
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* side rail: live launches + news for this company */}
          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <Reveal className="panel">
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Upcoming · {c.name_en}
              </div>
              {data.loading ? <div className="loading">LOADING…</div> : <LaunchList launches={companyLaunches.slice(0, 5)} />}
            </Reveal>
            <Reveal className="panel" delay={80}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                News
              </div>
              {news.loading ? <div className="loading">LOADING…</div> : <NewsList articles={news.articles.slice(0, 6)} />}
            </Reveal>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .co-layout { grid-template-columns: 1fr !important; } }`}</style>
    </>
  )
}
